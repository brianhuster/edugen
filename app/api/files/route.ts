import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { File } from '@/lib/models';
import { getReviewStatus } from '@/lib/fsrs';

/**
 * GET /api/files - List user's files with FSRS status
 * GET /api/files?id=xxx - Get single file details with content
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');

    await connectDB();

    // Case 1: Get Single File (with content)
    if (fileId) {
      const file = await File.findOne({ 
        _id: fileId, 
        userId: session.user.id 
      }).lean();

      if (!file) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      const status = getReviewStatus(file.fsrsState);
      
      return NextResponse.json({
        file: {
          _id: file._id.toString(),
          fileName: file.fileName,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
          createdAt: file.createdAt,
          lastReviewedAt: file.lastReviewedAt,
          reviewStatus: status,
          fsrsState: file.fsrsState,
          content: file.content, // Include content only for single file fetch
        }
      });
    }

    // Case 2: List All Files (summary only)
    const files: any[] = await File.find({ userId: session.user.id })
      .select('-content') // Exclude content field to reduce payload size
      .sort({ createdAt: -1 })
      .lean();

    // Add review status to each file
    const filesWithStatus = files.map((file) => {
      const status = getReviewStatus(file.fsrsState);
      return {
        _id: file._id.toString(),
        fileName: file.fileName,
        mimeType: file.mimeType,
        createdAt: file.createdAt,
        lastReviewedAt: file.lastReviewedAt,
        reviewStatus: status,
        fsrsState: file.fsrsState,
      };
    });

    return NextResponse.json({ files: filesWithStatus });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/files?fileId=xxx - Delete a file
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    await connectDB();

    // Verify file belongs to user before deleting
    const file = await File.findOne({
      _id: fileId,
      userId: session.user.id,
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await File.deleteOne({ _id: fileId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
