import type {
  OcrTaskMeta,
  ParseResult,
  SaveCorrectionsInput,
  SaveCorrectionsResult,
} from './types';

/**
 * API 层（先 mock，后续替换为真实请求即可）
 *
 * - mock 数据源：/public/paper2bank/mock/paper2bank-result.json
 * - 真实实现时：把 fetch(url) 改为后端接口即可；不要改上层组件。
 */

const MOCK_URL = '/paper2bank/mock/paper2bank-result.json';

async function fetchMockJson(): Promise<ParseResult> {
  const res = await fetch(MOCK_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`mock fetch failed: ${res.status}`);
  }
  return (await res.json()) as ParseResult;
}

export async function getOcrMeta(importId: string): Promise<OcrTaskMeta> {
  const raw = await fetchMockJson();
  return {
    ...(raw.meta ?? { importId }),
    importId,
  };
}

export async function getParseResult(importId: string): Promise<ParseResult> {
  const raw = await fetchMockJson();
  return {
    ...raw,
    meta: { ...(raw.meta ?? { importId }), importId },
  };
}

export async function getOcrText(importId: string, questionId: string): Promise<string> {
  const raw = await getParseResult(importId);
  return raw.ocrTextById?.[questionId] ?? '';
}

export async function saveCorrections(input: SaveCorrectionsInput): Promise<SaveCorrectionsResult> {
  // mock：先假装保存成功；真实实现时可 PATCH /imports/:id/corrections
  // 这里保留统一出口，便于后续接入。
  await new Promise((r) => setTimeout(r, 250));
  return { ok: true, savedIds: input.patches.map((p) => p.id) };
}



