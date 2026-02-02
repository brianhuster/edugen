import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User, File } from '@/lib/models';
import { isDueToday, getDaysUntilDue } from '@/lib/fsrs';
import { sendReminderEmail } from '@/lib/email';
import { auth } from '@/lib/auth';

/**
 * POST /api/test-reminder - Test reminder email for current user
 * Only works in development mode or for authenticated users
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get current user
    const user = await User.findById(session.user.id).lean();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's files
    const files: any[] = await File.find({ userId: user._id }).lean();
    
    console.log(`Found ${files.length} files for user ${user.email}`);
    
    // Filter files that are due (including overdue)
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

    console.log(`Found ${dueFiles.length} due files`);

    // If no files due, return info about next due file
    if (dueFiles.length === 0) {
      const nextDueFile = files
        .map(f => ({
          fileName: f.fileName,
          daysUntil: getDaysUntilDue(f.fsrsState),
          due: f.fsrsState.due,
        }))
        .sort((a, b) => a.daysUntil - b.daysUntil)[0];

      return NextResponse.json({
        success: false,
        message: 'No files due for review today',
        nextDueFile: nextDueFile || null,
        totalFiles: files.length,
      });
    }

    // Send reminder email
    const success = await sendReminderEmail(
      user.email,
      user.name || 'bạn',
      dueFiles
    );

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Reminder email sent to ${user.email}`,
        filesCount: dueFiles.length,
        files: dueFiles.map(f => ({
          fileName: f.fileName,
          daysOverdue: f.daysOverdue,
        })),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email',
          filesCount: dueFiles.length,
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Test reminder error:', error);
    return NextResponse.json(
      {
        error: 'Test reminder failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
