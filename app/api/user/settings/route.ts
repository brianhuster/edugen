import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

/**
 * GET /api/user/settings - Get user settings
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('emailNotifications notificationTime');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      emailNotifications: user.emailNotifications ?? true,
      notificationTime: user.notificationTime ?? '09:00',
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/settings - Update user settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailNotifications, notificationTime } = body;

    // Validate inputs
    if (typeof emailNotifications !== 'boolean') {
      return NextResponse.json(
        { error: 'emailNotifications must be a boolean' },
        { status: 400 }
      );
    }

    if (notificationTime && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(notificationTime)) {
      return NextResponse.json(
        { error: 'Invalid time format (use HH:MM)' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        emailNotifications,
        notificationTime: notificationTime || '09:00',
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      emailNotifications: user.emailNotifications,
      notificationTime: user.notificationTime,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
