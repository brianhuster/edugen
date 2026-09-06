import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User, File } from '@/lib/models';
import { isDueToday, getDaysUntilDue } from '@/lib/fsrs';
import { sendReminderEmail } from '@/lib/email';

/**
 * POST /api/trigger-reminder - Manually trigger email reminder for current user
 * This endpoint allows logged-in users to test email reminders immediately
 * without waiting for the cron job
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get current user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if email notifications are enabled
    if (!user.emailNotifications) {
      return NextResponse.json({
        success: false,
        message: 'Email notifications are disabled. Please enable them in Settings.',
      }, { status: 400 });
    }

    // Get user's files that are due today
    const files: any[] = await File.find({ userId: user._id }).lean();
    
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

    // If no files due, return info about next due file
    if (dueFiles.length === 0) {
      const upcomingFiles = files
        .map(file => ({
          fileName: file.fileName,
          daysUntil: getDaysUntilDue(file.fsrsState),
          due: file.fsrsState.due,
        }))
        .filter(f => f.daysUntil > 0)
        .sort((a, b) => a.daysUntil - b.daysUntil);

      const nextFile = upcomingFiles[0];

      return NextResponse.json({
        success: false,
        message: 'No files due for review today',
        totalFiles: files.length,
        dueFiles: 0,
        nextDueFile: nextFile ? {
          fileName: nextFile.fileName,
          daysUntil: nextFile.daysUntil,
          dueDate: nextFile.due,
        } : null,
      }, { status: 200 });
    }

    // Send reminder email
    const emailSent = await sendReminderEmail(
      user.email,
      user.name || 'bạn',
      dueFiles
    );

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: `Email sent successfully with ${dueFiles.length} file(s)`,
        filesIncluded: dueFiles.map(f => ({
          fileName: f.fileName,
          daysOverdue: f.daysOverdue || 0,
        })),
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send email. Please check your email configuration.',
        error: 'Email sending failed',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Trigger reminder error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger reminder',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
