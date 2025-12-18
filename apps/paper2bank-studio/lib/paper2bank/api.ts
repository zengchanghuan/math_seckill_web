'use client';

import { readClientConfig } from './config';

export type ApiErrorBody = {
  code?: string;
  message?: string;
  details?: unknown;
  trace_id?: string;
};

export type ApiError = {
  status: number;
  code: string;
  message: string;
  details?: unknown;
  traceId?: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
};

export type ImportItem = {
  id: string;
  project_id?: string;
  status?: string;
  paper2bank_job_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ImportDetail = ImportItem & {
  // 兼容：后端可能返回更多字段
  [k: string]: unknown;
};

function joinUrl(baseUrl: string, path: string) {
  const b = baseUrl.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

async function safeJson(res: Response): Promise<any | undefined> {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return undefined;
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { baseUrl, apiKey } = readClientConfig();
  const res = await fetch(joinUrl(baseUrl, path), {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
    },
  });

  if (!res.ok) {
    const body = (await safeJson(res)) as ApiErrorBody | undefined;
    const traceId = res.headers.get('x-trace-id') || body?.trace_id;
    const code = body?.code || `HTTP_${res.status}`;
    const message = body?.message || res.statusText || 'Request failed';
    const err: ApiError = { status: res.status, code, message, details: body?.details, traceId };
    throw err;
  }

  // 某些接口可能返回空 body
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function healthz(): Promise<any> {
  const { baseUrl } = readClientConfig();
  const res = await fetch(joinUrl(baseUrl, '/healthz'));
  const body = await safeJson(res);
  if (!res.ok) {
    throw { status: res.status, code: `HTTP_${res.status}`, message: res.statusText } satisfies ApiError;
  }
  return body ?? { ok: true };
}

export async function listProjects(): Promise<Project[]> {
  return await request<Project[]>('/api/v1/projects');
}

export async function createProject(input: { name: string; description?: string }): Promise<Project> {
  return await request<Project>('/api/v1/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function getProject(projectId: string): Promise<Project> {
  return await request<Project>(`/api/v1/projects/${encodeURIComponent(projectId)}`);
}

export async function listProjectImports(projectId: string): Promise<ImportItem[]> {
  return await request<ImportItem[]>(`/api/v1/projects/${encodeURIComponent(projectId)}/imports`);
}

export async function createImport(projectId: string, file: File): Promise<ImportItem> {
  const { baseUrl, apiKey } = readClientConfig();
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(joinUrl(baseUrl, `/api/v1/projects/${encodeURIComponent(projectId)}/imports`), {
    method: 'POST',
    headers: apiKey ? { 'X-API-Key': apiKey } : undefined,
    body: fd,
  });
  if (!res.ok) {
    const body = (await safeJson(res)) as ApiErrorBody | undefined;
    const traceId = res.headers.get('x-trace-id') || body?.trace_id;
    throw {
      status: res.status,
      code: body?.code || `HTTP_${res.status}`,
      message: body?.message || res.statusText || 'Upload failed',
      details: body?.details,
      traceId,
    } satisfies ApiError;
  }
  return (await res.json()) as ImportItem;
}

export async function getImport(importId: string): Promise<ImportDetail> {
  return await request<ImportDetail>(`/api/v1/imports/${encodeURIComponent(importId)}`);
}

export function getDownloadUrl(importId: string, kind: 'export' | 'report') {
  const { baseUrl } = readClientConfig();
  return joinUrl(baseUrl, `/api/v1/imports/${encodeURIComponent(importId)}/${kind}`);
}

export function getOcrUrl(projectId: string, importId: string, kind: 'meta' | 'text') {
  const { baseUrl } = readClientConfig();
  return joinUrl(
    baseUrl,
    `/api/v1/projects/${encodeURIComponent(projectId)}/imports/${encodeURIComponent(importId)}/ocr/${kind}`
  );
}




