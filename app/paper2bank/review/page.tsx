'use client';

import { useMemo, useState } from 'react';

export default function Paper2BankReviewEntry() {
  const [importId, setImportId] = useState('IMP-DEMO-001');
  const href = useMemo(() => {
    const v = importId.trim();
    return v ? `/paper2bank/review/${encodeURIComponent(v)}` : '';
  }, [importId]);

  return (
    <div className="mx-auto max-w-[860px] px-4 py-8">
      <div className="text-[30px] font-bold leading-[36px] tracking-[-0.3545px] text-[#0F172B]">
        OCR 校对工作台
      </div>
      <div className="mt-2 text-[14px] leading-[24px] text-[#62748E]">
        输入 Import ID 进入校对 Drawer（当前使用本地
        mock：`/public/paper2bank/mock/paper2bank-result.json`）。
      </div>

      <div className="mt-6 rounded-[14px] border border-[#E2E8F0] bg-white p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <div className="text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[#0F172B]">
          Import ID
        </div>
        <input
          value={importId}
          onChange={(e) => setImportId(e.target.value)}
          placeholder="例如：IMP-DEMO-001"
          className="mt-2 h-10 w-full rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-[14px] text-[#0F172B] outline-none focus:ring-4 focus:ring-indigo-100"
        />

        <a
          href={href || '#'}
          aria-disabled={!href}
          className={`mt-4 inline-flex h-10 w-full items-center justify-center rounded-[10px] text-[14px] font-semibold leading-[20px] tracking-[-0.1504px] ${
            href
              ? 'bg-[#4F39F6] text-white hover:brightness-95'
              : 'cursor-not-allowed bg-[#E2E8F0] text-[#90A1B9]'
          }`}
        >
          进入校对
        </a>
      </div>
    </div>
  );
}



