'use client';

import { useMemo, useState } from 'react';

export function EvidencePanel({
  ocrText,
  imageUrl,
}: {
  ocrText: string;
  imageUrl?: string;
}) {
  const [zoom, setZoom] = useState(1);

  const hasImage = useMemo(() => !!(imageUrl && imageUrl.trim()), [imageUrl]);

  return (
    <div className="flex h-full flex-col border-l border-black/10 bg-white">
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
        <div className="text-[13px] font-semibold text-[#0F172B]">证据区</div>
        {hasImage ? (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#62748E]">缩放</span>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
            <span className="w-10 text-right text-[12px] text-[#62748E]">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="text-[12px] font-medium text-[#62748E]">OCR 原文（纯文本）</div>
        <pre className="mt-2 whitespace-pre-wrap break-words rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-[12px] leading-[18px] text-[#0F172B]">
          {ocrText || '（无 OCR 原文）'}
        </pre>

        <div className="mt-4 text-[12px] font-medium text-[#62748E]">页面图片（可选）</div>
        {hasImage ? (
          <div className="mt-2 overflow-auto rounded-[10px] border border-[#E2E8F0] bg-white p-2">
            <img
              src={imageUrl}
              alt="evidence"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              className="max-w-none"
            />
          </div>
        ) : (
          <div className="mt-2 rounded-[10px] border border-dashed border-[#E2E8F0] bg-white p-3 text-[12px] text-[#90A1B9]">
            （无图片 URL）
          </div>
        )}
      </div>
    </div>
  );
}







