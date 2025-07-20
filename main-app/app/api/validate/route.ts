// app/api/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateWithGemini, ExperimentMetadata } from '@/lib/aiValidator';

export async function POST(req: NextRequest) {
  try {
    const { metadata, code }: { metadata: ExperimentMetadata; code: string } = await req.json();

    const report = await validateWithGemini(code, metadata);

    return NextResponse.json({
      score: report.score,
      limitations: report.limitations,
      suggestions: report.suggestions,
    });
  } catch (err: any) {
    console.error('Validation error:', err);
    return NextResponse.json({ error: 'Failed to run validation' }, { status: 500 });
  }
}
