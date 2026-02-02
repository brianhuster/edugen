import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User, File } from '@/lib/models';
import { isDueToday, getDaysUntilDue, getReviewStatus } from '@/lib/fsrs';

/**
 * GET /api/debug-email - Debug why emails are not being sent
 * Returns detailed information about user settings and file states
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user info
    const user = await User.findById(session.user.id).select('email name emailNotifications notificationTime createdAt');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all user's files
    const files: any[] = await File.find({ userId: session.user.id })
      .select('fileName fsrsState lastReviewedAt createdAt')
      .sort({ 'fsrsState.due': 1 })
      .lean();

    // Analyze each file
    const fileAnalysis = files.map((file) => {
      const status = getReviewStatus(file.fsrsState);
      const daysUntil = getDaysUntilDue(file.fsrsState);
      const isDue = isDueToday(file.fsrsState);
      
      return {
        fileName: file.fileName,
        fsrsState: {
          state: file.fsrsState.state,
          due: file.fsrsState.due,
          stability: file.fsrsState.stability,
          reps: file.fsrsState.reps,
          lapses: file.fsrsState.lapses,
        },
        lastReviewedAt: file.lastReviewedAt,
        createdAt: file.createdAt,
        analysis: {
          isDueToday: isDue,
          daysUntilDue: daysUntil,
          status: status.status,
          message: status.message,
          willBeInEmail: isDue, // Email sẽ chứa file này không?
        },
      };
    });

    // Count files by status
    const dueToday = fileAnalysis.filter(f => f.analysis.isDueToday);
    const overdue = fileAnalysis.filter(f => f.analysis.status === 'overdue');
    const upcoming = fileAnalysis.filter(f => f.analysis.status === 'upcoming');
    const newFiles = fileAnalysis.filter(f => f.analysis.status === 'new');

    // Check email configuration
    const emailConfigured = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    const cronConfigured = !!process.env.CRON_SECRET;

    // Get current time info
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const utcTime = new Date(now.toUTCString());

    const debugInfo = {
      // User Settings
      userSettings: {
        email: user.email,
        name: user.name,
        emailNotifications: user.emailNotifications,
        notificationTime: user.notificationTime,
        accountCreatedAt: user.createdAt,
      },

      // Environment Check
      systemConfig: {
        emailConfigured,
        cronConfigured,
        gmailUser: process.env.GMAIL_USER ? '✅ Configured' : '❌ Missing',
        gmailPassword: process.env.GMAIL_APP_PASSWORD ? '✅ Configured' : '❌ Missing',
        cronSecret: process.env.CRON_SECRET ? '✅ Configured' : '❌ Missing',
        nextAuthUrl: process.env.NEXTAUTH_URL || 'Not set',
      },

      // Time Information
      timeInfo: {
        currentUTC: utcTime.toISOString(),
        currentVietnam: vietnamTime.toISOString(),
        cronSchedule: '0 9 * * * (9:00 AM UTC = 4:00 PM Vietnam)',
        userNotificationTime: `${user.notificationTime} (NOT USED - cron runs at fixed time)`,
      },

      // File Statistics
      fileStats: {
        total: files.length,
        dueToday: dueToday.length,
        overdue: overdue.length,
        upcoming: upcoming.length,
        new: newFiles.length,
      },

      // Files that WOULD be included in email
      filesInNextEmail: dueToday.map(f => ({
        fileName: f.fileName,
        dueDate: f.fsrsState.due,
        daysOverdue: f.analysis.daysUntilDue < 0 ? Math.abs(f.analysis.daysUntilDue) : 0,
        lastReviewed: f.lastReviewedAt || 'Never',
      })),

      // All files with detailed status
      allFiles: fileAnalysis,

      // Diagnostic Results
      diagnostics: {
        willReceiveEmail: user.emailNotifications && dueToday.length > 0,
        reasons: [] as string[],
      },
    };

    // Determine why user won't receive email
    if (!user.emailNotifications) {
      debugInfo.diagnostics.reasons.push('❌ Email notifications are DISABLED in settings');
    } else {
      debugInfo.diagnostics.reasons.push('✅ Email notifications are ENABLED');
    }

    if (dueToday.length === 0) {
      debugInfo.diagnostics.reasons.push('❌ NO files are due today');
      if (upcoming.length > 0) {
        const nextFile = upcoming[0];
        debugInfo.diagnostics.reasons.push(
          `ℹ️ Next file "${nextFile.fileName}" will be due in ${nextFile.analysis.daysUntilDue} days`
        );
      }
    } else {
      debugInfo.diagnostics.reasons.push(`✅ ${dueToday.length} file(s) are due today`);
    }

    if (!emailConfigured) {
      debugInfo.diagnostics.reasons.push('❌ Gmail SMTP is NOT configured (missing credentials)');
    } else {
      debugInfo.diagnostics.reasons.push('✅ Gmail SMTP is configured');
    }

    if (!cronConfigured) {
      debugInfo.diagnostics.reasons.push('⚠️ CRON_SECRET is NOT set (cron job may fail)');
    } else {
      debugInfo.diagnostics.reasons.push('✅ CRON_SECRET is configured');
    }

    // Add explanation
    debugInfo.diagnostics.reasons.push('');
    debugInfo.diagnostics.reasons.push('📝 HOW EMAILS WORK:');
    debugInfo.diagnostics.reasons.push('1. Cron job runs daily at 9:00 AM UTC (4:00 PM Vietnam)');
    debugInfo.diagnostics.reasons.push('2. Checks users with emailNotifications = true');
    debugInfo.diagnostics.reasons.push('3. Finds files where fsrsState.due <= today (at 00:00:00)');
    debugInfo.diagnostics.reasons.push('4. Sends ONE email with list of ALL due files');
    debugInfo.diagnostics.reasons.push('5. No email if no files are due');

    return NextResponse.json(debugInfo, { status: 200 });

  } catch (error) {
    console.error('Debug email error:', error);
    return NextResponse.json(
      {
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
