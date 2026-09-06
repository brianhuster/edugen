import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { File } from '@/lib/models';
import { initializeFSRS } from '@/lib/fsrs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let extractedText: string | undefined;
    let geminiFileUri: string | undefined;
    let geminiFileName: string | undefined;

    // Handle plain text files directly — no need to use Gemini
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      extractedText = buffer.toString('utf-8');

      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json({ error: 'File is empty' }, { status: 400 });
      }
    } else {
      // For other files (PDF, DOCX, ...), upload to Gemini File API
      // No text extraction needed — Gemini will read the file directly when generating
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // Upload to Gemini using Blob (no need to save temp file)
      let uploadResult;
      try {
        const blob = new Blob([buffer], { type: file.type });
        uploadResult = await ai.files.upload({
          file: blob,
          config: {
            mimeType: file.type,
            displayName: file.name,
          },
        });
        console.log('Upload result:', JSON.stringify(uploadResult, null, 2));
      } catch (uploadError) {
        console.error('Upload failed:', JSON.stringify(uploadError, null, 2));
        throw uploadError;
      }

      // Wait for file to be processed
      let uploadedFile = await ai.files.get({ name: uploadResult.name! });
      console.log('Initial file state:', uploadedFile.state);

      while (uploadedFile.state === 'PROCESSING') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        uploadedFile = await ai.files.get({ name: uploadResult.name! });
        console.log('File state:', uploadedFile.state);
      }

      if (uploadedFile.state === 'FAILED') {
        console.error('File processing failed:', JSON.stringify(uploadedFile, null, 2));
        throw new Error('File processing failed');
      }

      geminiFileUri = uploadedFile.uri;
      geminiFileName = uploadedFile.name;
    }

    // Save file to MongoDB with FSRS state
    await connectDB();

    const newFile = await File.create({
      userId: session.user.id,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      content: extractedText,       // Only set for .txt files
      geminiFileId: geminiFileName, // Only set for non-txt files
      uri: geminiFileUri,           // Only set for non-txt files
      fsrsState: initializeFSRS(),
    });

    return NextResponse.json({
      fileId: newFile._id.toString(),
      fileName: file.name,
      mimeType: file.type,
      text: extractedText,     // Only present for .txt files
      geminiFileUri,           // Only present for non-txt files
      geminiFileName,
    });

  } catch (error) {
    console.error('Error processing file:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json({ 
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : typeof error
    }, { status: 500 });
  }
}
