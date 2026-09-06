import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, File } from '@/lib/models';
import { isDueToday, getDaysUntilDue } from '@/lib/fsrs';
import { sendReminderEmail } from '@/lib/email';

/**
 * GET /api/cron/send-reminders - Send daily reminder emails
 * Protected by CRON_SECRET environment variable
 * 
 * This endpoint should be called daily by a cron job (e.g., via Vercel Cron or external service)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // Check if request is from Vercel Cron (has x-vercel-cron header)
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';

    console.log('Debug:', {
      hasCronSecret: !!cronSecret,
      cronSecretLength: cronSecret?.length,
      hasAuthHeader: !!authHeader,
      isVercelCron,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('CRON'))
    });

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }

    // Allow Vercel Cron system OR valid CRON_SECRET
    if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`Cron triggered by: ${isVercelCron ? 'Vercel Cron System' : 'Manual with CRON_SECRET'}`);

    await connectDB();

    // Get all users with email notifications enabled
    const users = await User.find({
      emailNotifications: true,
    }).lean();

    console.log(`Processing reminders for ${users.length} users`);

    let emailsSent = 0;
    let emailsFailed = 0;

    // Process each user
    for (const user of users) {
      try {
        console.log(`\n--- Processing user: ${user.email} ---`);
        
        // Get user's files that are due today
        const files: any[] = await File.find({ userId: user._id }).lean();
        console.log(`Total files: ${files.length}`);
        
        // Log all files with due dates for debugging
        files.forEach(f => {
          const isDue = isDueToday(f.fsrsState);
          console.log(`  - "${f.fileName}": due=${f.fsrsState.due}, isDue=${isDue}`);
        });
        
        const dueFiles = files.filter((file) => 
          isDueToday(file.fsrsState)
        ).map((file) => {
          const daysUntil = getDaysUntilDue(file.fsrsState);
          return {
            _id: file._id.toString(),
            fileName: file.fileName,
            fsrsState: file.fsrsState,
            daysOverdue: daysUntil < 0 ? Math.abs(daysUntil) : undefined,
          };
        });

        // Skip if no files due
        if (dueFiles.length === 0) {
          console.log(`❌ No due files for user ${user.email}`);
          continue;
        }
        
        console.log(`✅ Found ${dueFiles.length} due file(s) for ${user.email}`);

        // Send reminder email
        const success = await sendReminderEmail(
          user.email,
          user.name || 'bạn',
          dueFiles
        );

        if (success) {
          emailsSent++;
          console.log(`Sent reminder to ${user.email} for ${dueFiles.length} files`);
        } else {
          emailsFailed++;
          console.error(`Failed to send reminder to ${user.email}`);
        }

        // Add delay to avoid rate limiting (1 second between emails)
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (userError) {
        console.error(`Error processing user ${user.email}:`, userError);
        emailsFailed++;
      }
    }

    const response = {
      success: true,
      totalUsers: users.length,
      emailsSent,
      emailsFailed,
      timestamp: new Date().toISOString(),
    };

    console.log('Cron job completed:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cron/send-reminders - Manual trigger (same as GET)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
