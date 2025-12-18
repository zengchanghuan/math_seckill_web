'use client';

import { useState, useEffect } from 'react';
import { pdfToImages } from '@/lib/pdfToImages';
import type { ParseResult } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { formatLatexForMarkdown } from '../../lib/latexUtils';

// KaTeX 全局配置：移除 macros 宏，改由预处理完成，避免冲突
const katexOptions = {
  strict: false,
  trust: true,
};

const CACHE_KEY = 'paper2bank_ocr_cache_v4'; // 再次升级缓存，确保新渲染规则生效

type CacheData = {
  images: string[];
  ocrText: string;
  timestamp: number;
};

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('FileReader failed'));
    fr.onload = () => resolve(String(fr.result));
    fr.readAsDataURL(file);
  });
}

// 题型映射表
const TYPE_MAP: Record<string, string> = {
  // 选择题类型（支持连字符和下划线）
  'multiple-choice': '选择题',
  'multiple_choice': '选择题',
  'single-choice': '单选题',
  'single_choice': '单选题',
  'multi-choice': '多选题',
  'multi_choice': '多选题',
  choice: '选择题',
  
  // 填空题类型
  'fill-in-the-blank': '填空题',
  'fill_in_the_blank': '填空题',
  'fill-in': '填空题',
  'fill_in': '填空题',
  blank: '填空题',
  
  // 计算题类型
  calculation: '计算题',
  compute: '计算题',
  
  // 解答题类型
  'problem-solving': '解答题',
  'problem_solving': '解答题',
  solving: '解答题',
  answer: '解答题',
  
  // 判断题类型
  'true-or-false': '判断题',
  'true_or_false': '判断题',
  'true-false': '判断题',
  'true_false': '判断题',
  judge: '判断题',
  judgment: '判断题',
  
  // 综合题类型
  comprehensive: '综合题',
  synthesis: '综合题',
  
  // 证明题类型
  proof: '证明题',
  prove: '证明题',
  
  // 应用题类型
  application: '应用题',
  
  // 简答题类型
  'short-answer': '简答题',
  'short_answer': '简答题',
  essay: '简答题',
};

function formatTypeName(type: string): string {
  // 标准化：转小写，并将下划线转为连字符
  const normalized = type.toLowerCase().replace(/_/g, '-');
  return TYPE_MAP[normalized] || type;
}

export default function ExtractorPage() {
  const [images, setImages] = useState<string[]>([]);
  const [ocrText, setOcrText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [hasCache, setHasCache] = useState(false);

  // 检查是否有缓存
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      setHasCache(!!cached);
    } catch (e) {
      // localStorage 不可用
    }
  }, []);

  // 保存到缓存
  function saveCache(imgs: string[], text: string) {
    try {
      const data: CacheData = {
        images: imgs,
        ocrText: text,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      setHasCache(true);
    } catch (e) {
      console.warn('缓存失败:', e);
    }
  }

  // 从缓存恢复
  function loadCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return;
      const data: CacheData = JSON.parse(cached);
      setImages(data.images);
      setOcrText(data.ocrText);
    } catch (e) {
      setErr('缓存读取失败');
    }
  }

  // 上传文件并自动识别（先检查缓存）
  async function handleFile(file: File) {
    setErr('');
    setOcrText('');
    setBusy(true);
    try {
      // 生成基于文件的缓存键（文件名+大小+修改时间）
      const fileCacheKey = `ocr_file_${file.name}_${file.size}_${file.lastModified}`;
      
      // 先检查文件级缓存
      const cachedText = localStorage.getItem(fileCacheKey);
      if (cachedText) {
        console.log('💾 使用缓存的OCR结果，节省token');
        // 仍需要解析PDF/图片以显示在左侧
        const isPdf =
          file.type === 'application/pdf' ||
          file.name.toLowerCase().endsWith('.pdf');
        const imgs = isPdf
          ? await pdfToImages(file)
          : [await fileToDataUrl(file)];
        setImages(imgs);
        setOcrText(cachedText);
        setBusy(false);
        return;
      }

      const isPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');
      const imgs = isPdf
        ? await pdfToImages(file)
        : [await fileToDataUrl(file)];
      setImages(imgs);

      // 无缓存，调用 OCR API
      console.log('🔄 调用OCR API识别...');
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagesBase64: imgs }),
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as ParseResult;

      console.log('OCR API返回的数据:', json);

      let lastType = '';
      const text = json.questions
        .map((q, idx) => {
          let block = '';

          // 如果题目类型发生变化，添加类型标题
          if (q.type && q.type !== lastType) {
            const typeName = formatTypeName(q.type);
            console.log(`题型映射: ${q.type} -> ${typeName}`);
            block += `### ${typeName}\n\n`;
            lastType = q.type;
          }

          const stem = formatLatexForMarkdown(q.stem);
          block += `**${idx + 1}.** ${stem}\n\n`;

          if (q.options?.length) {
            q.options.forEach((opt, i) => {
              const formattedOpt = formatLatexForMarkdown(opt);
              block += `${String.fromCharCode(65 + i)}. ${formattedOpt}\n\n`;
            });
          }
          return block.trim();
        })
        .join('\n\n---\n\n');

      setOcrText(text);
      
      // 保存到文件级缓存
      try {
        localStorage.setItem(fileCacheKey, text);
        console.log('✅ OCR结果已缓存');
      } catch (e) {
        console.warn('缓存保存失败:', e);
      }
      
      // 同时保存到旧的缓存系统（用于"使用上次输入"功能）
      saveCache(imgs, text);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'OCR 识别失败');
    } finally {
      setBusy(false);
    }
  }

  // 生成缓存 key
  function cacheKeyForImages(imgs: string[]): string {
    return `ocr_${imgs.map((s) => s.slice(0, 64)).join('_')}`;
  }

  // 根据 key 获取缓存
  function getCacheByKey(key: string): CacheData | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const data: CacheData = JSON.parse(cached);
      // 简单判断：如果图片数量和前64字符一致，认为是同一批
      if (data.images.length === images.length) {
        return data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function reset() {
    setImages([]);
    setOcrText('');
    setErr('');
  }

  function clearCache() {
    try {
      localStorage.removeItem(CACHE_KEY);
      setHasCache(false);
    } catch (e) {
      // ignore
    }
  }

  // 初始上传界面
  if (!images.length && !busy) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
        {/* Header */}
        <div className="flex w-full items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800">
              paper<span className="text-blue-600">Bank</span>
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-3xl">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-slate-800">文档解析</h1>
              <p className="mt-3 text-base text-slate-500">
                全格式兼容 · 精准提取 · 极速输出
              </p>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed bg-white p-16 shadow-sm transition-all ${
                dragActive
                  ? 'border-blue-400 bg-blue-50/50 shadow-lg'
                  : 'border-slate-300 hover:border-slate-400 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <svg
                      className="h-8 w-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                <div className="mb-6 flex gap-3">
                  <label className="cursor-pointer rounded-lg border-2 border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50">
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleFile(f);
                      }}
                    />
                    📎 本地上传
                  </label>
                  {hasCache ? (
                    <button
                      onClick={loadCache}
                      className="rounded-lg border-2 border-blue-300 bg-blue-50 px-6 py-2.5 text-sm font-medium text-blue-700 transition-all hover:border-blue-400 hover:bg-blue-100"
                    >
                      🔄 使用上次输入
                    </button>
                  ) : null}
                </div>

                {hasCache ? (
                  <button
                    onClick={clearCache}
                    className="mb-4 text-xs text-slate-400 hover:text-red-500"
                  >
                    清除缓存
                  </button>
                ) : null}

                <p className="text-sm text-slate-400">点击或拖拽上传</p>
                <p className="mt-2 text-xs text-slate-400">
                  支持 PDF、JPG、PNG 格式
                </p>
              </div>
            </div>

            {err ? (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {err}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // 处理中
  if (busy) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-slate-200 border-t-blue-500"></div>
          <p className="text-sm text-slate-600">识别中，请稍候…</p>
        </div>
      </div>
    );
  }

  // 对比界面
  if (images.length && ocrText) {
    return (
      <div className="flex h-screen flex-col bg-slate-50">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800">
              paper<span className="text-blue-600">Bank</span>
            </span>
          </div>
          <button
            onClick={reset}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← 返回上传
          </button>
        </div>

        <div className="grid flex-1 grid-cols-3 overflow-hidden">
          {/* 左侧：原始文件 */}
          <div className="overflow-auto border-r border-slate-200 bg-white p-6">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              原始文件
            </div>
            <div className="space-y-4">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`page ${idx + 1}`}
                  className="w-full rounded-lg border border-slate-200 shadow-sm"
                />
              ))}
            </div>
          </div>

          {/* 中间：渲染预览 */}
          <div className="flex flex-col overflow-auto border-r border-slate-200 bg-white p-6">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              渲染预览
            </div>
            <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-hr:my-4 prose-headings:mb-2">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[[rehypeKatex, katexOptions]]}
              >
                {ocrText}
              </ReactMarkdown>
            </div>
          </div>

          {/* 右侧：OCR 文本（可编辑） */}
          <div className="flex flex-col overflow-hidden bg-slate-50 p-6">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              OCR 识别结果（可编辑）
            </div>
            <textarea
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              className="flex-1 resize-none rounded-lg border border-slate-200 bg-white p-4 font-mono text-sm leading-relaxed text-slate-800 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="OCR 结果将显示在这里..."
            />
          </div>
        </div>
      </div>
    );
  }
}
