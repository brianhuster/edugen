import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { File, ReviewHistory } from '@/lib/models';
import { reviewFile } from '@/lib/fsrs';

/**
 * POST /api/files/review - Submit a review rating for a file
 * Body: { fileId: string, rating: 1 | 2 | 3 | 4 }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileId, rating } = body;

    if (!fileId || !rating) {
      return NextResponse.json(
        { error: 'File ID and rating required' },
        { status: 400 }
      );
    }

    if (![1, 2, 3, 4].includes(rating)) {
      return NextResponse.json(
        { error: 'Rating must be 1 (Again), 2 (Hard), 3 (Good), or 4 (Easy)' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the file and verify ownership
    const file = await File.findOne({
      _id: fileId,
      userId: session.user.id,
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Calculate new FSRS state
    const oldState = file.fsrsState;
    const newState = reviewFile(oldState, rating as 1 | 2 | 3 | 4, new Date());

    // Save review history
    await ReviewHistory.create({
      userId: session.user.id,
      fileId: file._id,
      rating,
      oldFsrsState: oldState,
      newFsrsState: newState,
      reviewedAt: new Date(),
    });

    // Update file with new FSRS state
    file.fsrsState = newState;
    file.lastReviewedAt = new Date();
    await file.save();

    return NextResponse.json({
      success: true,
      newState,
      message: 'Review submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit review',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
