import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const CACHE_VERSION = 'v4-deepseek-qwen-compare';
const CACHE_DIR = path.join(process.cwd(), '.paper2bank-cache');

function ensureDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function sha256(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

export function cacheKey(prefix: string, payload: unknown) {
  return `${prefix}-${sha256(`${CACHE_VERSION}:${JSON.stringify(payload)}`)}.json`;
}

export function cacheGet<T>(key: string): T | null {
  try {
    ensureDir();
    const p = path.join(CACHE_DIR, key);
    if (!fs.existsSync(p)) return null;
    const txt = fs.readFileSync(p, 'utf-8');
    return JSON.parse(txt) as T;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, value: T) {
  ensureDir();
  const p = path.join(CACHE_DIR, key);
  fs.writeFileSync(p, JSON.stringify(value, null, 2), 'utf-8');
}


