'use client';

import { useMemo, useState } from 'react';
import { OcrReviewDrawer } from '@/components/ocr-review/OcrReviewDrawer';

export default function Paper2BankReviewPage({
  params,
}: {
  params: { importId: string };
}) {
  const importId = params.importId;
  const [drawerOpen, setDrawerOpen] = useState(true);

  const title = useMemo(() => {
    const v = `${importId}`.trim();
    return v ? v : 'IMP-UNKNOWN';
  }, [importId]);

  return (
    <div className="h-screen w-full bg-slate-50">
      <div className="flex h-full w-full">
        {/* 主流程（不被遮挡，会因 Drawer 打开而收缩） */}
        <main className="min-w-0 flex-1">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-4">
              <div className="min-w-0">
                <div className="truncate text-[16px] font-semibold text-[#0F172B]">
                  {title}
                </div>
                <div className="mt-1 text-[12px] text-[#62748E]">
                  这里是主流程占位（后续可接 PDF/图片预览、裁剪定位等）。右侧为
                  OCR 校对 Drawer。
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/paper2bank/review"
                  className="h-9 rounded-[10px] border border-black/10 bg-white px-3 text-[12px] font-semibold text-[#0F172B] hover:bg-[#F8FAFC] flex items-center"
                >
                  返回
                </a>
                <button
                  type="button"
                  onClick={() => setDrawerOpen((v) => !v)}
                  className="h-9 rounded-[10px] bg-[#4F39F6] px-3 text-[12px] font-semibold text-white hover:brightness-95"
                >
                  {drawerOpen ? '收起 OCR 校对' : '打开 OCR 校对'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="rounded-[14px] border border-black/10 bg-white p-6 text-[14px] text-[#62748E]">
                主流程区域（占位）：你可以在这里放 “Extractor 风格” 的 PDF
                预览/页码/裁剪框等。
              </div>
            </div>
          </div>
        </main>

        {/* Drawer（右侧 45%~60% 宽度，不遮挡） */}
        <OcrReviewDrawer
          open={drawerOpen}
          importId={importId}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </div>
  );
}

