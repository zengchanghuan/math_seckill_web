import { NextResponse } from 'next/server';
import { qwenOcrQuestionsFromImages } from '@/lib/qwen';
import { cacheGet, cacheKey, cacheSet } from '@/lib/server/cache';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = (await req.json()) as { imagesBase64: string[] };
  if (!body?.imagesBase64?.length) {
    return NextResponse.json(
      { error: 'imagesBase64 required' },
      { status: 400 }
    );
  }

  const key = cacheKey('ocr', {
    imagesBase64: body.imagesBase64.map((s) => s.slice(0, 64)),
  });
  const hit = cacheGet<unknown>(key);
  if (hit) return NextResponse.json(hit);

  const result = await qwenOcrQuestionsFromImages({
    imagesBase64: body.imagesBase64,
  });
  cacheSet(key, result);
  return NextResponse.json(result);
}
