import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendReminderEmail } from '@/lib/email';

/**
 * POST /api/user/test-email - Send a test reminder email
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Send a test email with dummy file data
    const testFiles = [
      {
        _id: 'test-1',
        fileName: 'Example Document.pdf',
        fsrsState: {} as any,
      },
      {
        _id: 'test-2',
        fileName: 'Sample Quiz.txt',
        fsrsState: {} as any,
        daysOverdue: 2,
      },
    ];

    const success = await sendReminderEmail(
      session.user.email,
      session.user.name || 'bạn',
      testFiles
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
