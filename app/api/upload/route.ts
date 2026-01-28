import { NextRequest, NextResponse } from 'next/server';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { File } from '@/lib/models';
import { initializeFSRS } from '@/lib/fsrs';

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
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
    let extractedText = '';
    let geminiFileUri: string | undefined;
    let geminiFileName: string | undefined;

    // Handle plain text files directly without uploading to Gemini
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      extractedText = buffer.toString('utf-8');
      
      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json({ error: 'File is empty' }, { status: 400 });
      }
    } else {
      // For other files, upload to Gemini File API
      const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
      
      // Save file temporarily
      tempFilePath = join(tmpdir(), `upload-${Date.now()}-${file.name}`);
      await writeFile(tempFilePath, buffer);

      // Upload to Gemini
      let uploadResult;
      try {
        uploadResult = await fileManager.uploadFile(tempFilePath, {
          mimeType: file.type,
          displayName: file.name,
        });
        console.log('Upload result:', JSON.stringify(uploadResult, null, 2));
      } catch (uploadError) {
        console.error('Upload failed - Full error object:', JSON.stringify(uploadError, null, 2));
        throw uploadError;
      }

      // Wait for file to be processed
      let uploadedFile = await fileManager.getFile(uploadResult.file.name);
      console.log('Initial file state:', uploadedFile.state);
      
      while (uploadedFile.state === 'PROCESSING') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        uploadedFile = await fileManager.getFile(uploadResult.file.name);
        console.log('File state:', uploadedFile.state);
      }

      if (uploadedFile.state === 'FAILED') {
        console.error('File processing failed. File details:', JSON.stringify(uploadedFile, null, 2));
        throw new Error('File processing failed');
      }

      geminiFileUri = uploadedFile.uri;
      geminiFileName = uploadedFile.name;

      // Extract text using Gemini
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      let result;
      try {
        result = await model.generateContent([
          {
            fileData: {
              mimeType: uploadedFile.mimeType,
              fileUri: uploadedFile.uri,
            },
          },
          'Trích xuất toàn bộ văn bản từ tài liệu này. Chỉ trả về nội dung văn bản, không thêm bất kỳ giải thích nào.',
        ]);
        console.log('Generate content response:', JSON.stringify(result, null, 2));
      } catch (generateError) {
        console.error('Generate content failed - Full error object:', JSON.stringify(generateError, null, 2));
        console.error('Generate content failed - Error details:', generateError);
        throw generateError;
      }

      extractedText = result.response.text();

      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 });
      }
    }

    // Save file to MongoDB with FSRS state
    await connectDB();
    
    const newFile = await File.create({
      userId: session.user.id,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      content: extractedText,
      geminiFileId: geminiFileName,
      uri: geminiFileUri,
      fsrsState: initializeFSRS(),
    });

    return NextResponse.json({ 
      fileId: newFile._id.toString(),
      text: extractedText,
      fileName: file.name,
      mimeType: file.type,
      geminiFileUri,
      geminiFileName
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
  } finally {
    // Clean up temp file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (e) {
        console.error('Failed to delete temp file:', e);
      }
    }
  }
}
