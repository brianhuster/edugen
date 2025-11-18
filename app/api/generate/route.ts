import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/gemini';
import { GenerateRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { text, config } = body;

    if (!text || !config) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Generate questions using Gemini
    const questions = await generateQuestions(text, config);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
