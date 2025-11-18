import { NextRequest, NextResponse } from 'next/server';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
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

    // Handle plain text files directly without uploading to Gemini
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = buffer.toString('utf-8');
      
      if (!text || text.trim().length === 0) {
        return NextResponse.json({ error: 'File is empty' }, { status: 400 });
      }

      return NextResponse.json({ 
        text,
        fileName: file.name,
        mimeType: file.type 
      });
    }

    // For other files, upload to Gemini File API
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    
    // Save file temporarily
    tempFilePath = join(tmpdir(), `upload-${Date.now()}-${file.name}`);
    await writeFile(tempFilePath, buffer);

    // Upload to Gemini
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: file.type,
      displayName: file.name,
    });

    // Wait for file to be processed
    let uploadedFile = await fileManager.getFile(uploadResult.file.name);
    while (uploadedFile.state === 'PROCESSING') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      uploadedFile = await fileManager.getFile(uploadResult.file.name);
    }

    if (uploadedFile.state === 'FAILED') {
      throw new Error('File processing failed');
    }

    // Extract text using Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadedFile.mimeType,
          fileUri: uploadedFile.uri,
        },
      },
      'Trích xuất toàn bộ văn bản từ tài liệu này. Chỉ trả về nội dung văn bản, không thêm bất kỳ giải thích nào.',
    ]);

    const text = result.response.text();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 });
    }

    return NextResponse.json({ 
      text,
      fileName: file.name,
      mimeType: file.type,
      geminiFileUri: uploadedFile.uri,
      geminiFileName: uploadedFile.name
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ 
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : 'Unknown error'
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
