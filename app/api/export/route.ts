import { NextRequest, NextResponse } from 'next/server';
import { Packer } from 'docx';
import { generateDocx } from '@/lib/docx-generator';
import { Question } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questions, title } = body as { questions: Question[]; title?: string };

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'No questions provided' }, { status: 400 });
    }

    // Generate Word document
    const doc = generateDocx(questions, title);
    const buffer = await Packer.toBuffer(doc);

    // Return as downloadable file
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="de-thi-${Date.now()}.docx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting document:', error);
    return NextResponse.json({ error: 'Failed to export document' }, { status: 500 });
  }
}
