'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const FIGMA_ICON_DIR = '/paper2bank/icons/figma-2-1155';

// 2:1155 相关资产（由官方 MCP 导出并落盘到 public）
const ICON = {
  // 2:1159
  exit: `${FIGMA_ICON_DIR}/dde6100b1c25930e6f44de7efd6917d4eebd944f.svg`,
  passed: `${FIGMA_ICON_DIR}/ffa64ee8172203430ff8300f33006e52819b69ae.svg`,

  // 2:1734
  crop: `${FIGMA_ICON_DIR}/50ae720e903f6ac22689c0249d0c6a34e1d62d92.svg`,
  pageView: `${FIGMA_ICON_DIR}/ea02f24fa8cf3ca748391f43ed3a8d96a57c8850.svg`,
  cropPreview: `${FIGMA_ICON_DIR}/f8e83656291868b230f74ada547c243d3906a53b.svg`,
  locate: `${FIGMA_ICON_DIR}/472f8765af878f8048ca24cc23319f15e82f57f9.svg`,

  // 2:1763
  chevronDown: `${FIGMA_ICON_DIR}/2df382ced4a8e36e47e769c5bd0d7fe6909950a8.svg`,
  ocr: `${FIGMA_ICON_DIR}/220c9734b187ed4b75378061b1cafeefb96af034.svg`,
  reset: `${FIGMA_ICON_DIR}/8a1e65a4e2dce83a303fa0f81fd48cc6cfc3dff6.svg`,
  insert: `${FIGMA_ICON_DIR}/cb96565a4eef13fb5d6158828598cfd157e1d8fd.svg`,
  insertAlt: `${FIGMA_ICON_DIR}/ac47cec6ce5d4cfa7ca8500590196ed3c86f49bc.svg`,
  insertAlt2: `${FIGMA_ICON_DIR}/25bb14b6c6248dd7ffb5c8eda52fb87b0e185bf7.svg`,
  insertSmall: `${FIGMA_ICON_DIR}/331075c1a3babd895aa1f0f0bf86cfd651af68f2.svg`,
  prev: `${FIGMA_ICON_DIR}/156d1a1e4b648f8157a653336e4e27e9f7e37cb1.svg`,
  next: `${FIGMA_ICON_DIR}/4d924c2cba02b99d734f04ab8e255fff96748d29.svg`,
  ok: `${FIGMA_ICON_DIR}/ff4753084e897b3b35d2b844f34322466633a67d.svg`,
  more: `${FIGMA_ICON_DIR}/ef5e0f7b4b91b23e47406e9518a0be7b12d48e93.svg`,
};

function pct(a: number, b: number) {
  if (!b) return 0;
  const v = Math.round((a / b) * 100);
  return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0;
}

export default function ReviewPage({ params }: { params: { importId: string } }) {
  const importId = params.importId;

  // Figma demo 数据：后续可接后端接口替换
  const [activeQ, setActiveQ] = useState(1);
  const totalQ = 42;
  const passedQ = 5;
  const remainingQ = Math.max(0, totalQ - passedQ);

  const progress = useMemo(() => pct(passedQ, totalQ), [passedQ, totalQ]);

  const title = useMemo(() => {
    const v = `${importId}`.trim();
    return v ? v : 'IMP-001-success';
  }, [importId]);

  return (
    <div className="-mx-4 -mt-4 w-[calc(100%+32px)]">
      <div className="h-[733px] w-full overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        {/* 顶栏（2:1159） */}
        <div className="flex h-[64px] items-center justify-between border-b border-black/10 bg-white px-4 pb-px">
          <div className="flex h-8 w-[551.8125px] items-center gap-4">
            <Link
              href={`/paper2bank/imports/${encodeURIComponent(importId)}`}
              className="relative inline-flex h-8 w-[102px] items-center rounded-[8px] hover:bg-slate-50"
              title="退出校对"
            >
              <span className="absolute left-[10px] top-2 h-4 w-4">
                <Image alt="" src={ICON.exit} fill className="object-contain" />
              </span>
              <span className="ml-9 text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[#62748E]">
                退出校对
              </span>
            </Link>

            <div className="h-0 w-px bg-black/10" />

            <div className="flex min-w-0 flex-1 items-center gap-6">
              <div className="flex min-w-0 items-center gap-2">
                <div className="truncate text-[16px] font-semibold leading-[24px] tracking-[-0.3125px] text-[#0F172B]">
                  {title}
                </div>
                <div className="flex h-[22px] items-center justify-center rounded-[8px] border border-black/10 bg-[#F8FAFC] px-[9px] py-[3px] text-[12px] leading-[16px] text-[#62748E]">
                  Q{activeQ}
                </div>
              </div>

              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="flex h-6 items-center gap-2 rounded-[4px] bg-[#ECFDF5] px-2">
                  <span className="relative h-[14px] w-[14px]">
                    <Image alt="" src={ICON.passed} fill className="object-contain" />
                  </span>
                  <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[#009966]">
                    已通过 {passedQ}/{totalQ}
                  </span>
                </div>
                <div className="text-[14px] leading-[20px] tracking-[-0.1504px] text-[#62748E]">
                  未校对剩余 {remainingQ}
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-[26px] flex-1 items-start justify-end">
            <div className="w-[448px]">
              <div className="flex items-start justify-between text-[12px] leading-[16px]">
                <span className="text-[#90A1B9]">总体进度</span>
                <span className="font-medium text-[#4F39F6]">{progress}%</span>
              </div>
              <div className="mt-1 h-[6px] w-[448px] overflow-hidden rounded-full bg-[rgba(3,2,19,0.2)]">
                <div className="h-full bg-[#030213]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* 主体（2:1189） */}
        <div className="flex h-[667px] w-full">
          {/* 左侧列表 */}
          <aside className="w-[280px] border-r border-black/10 bg-white">
            <div className="h-9 px-1 pt-1">
              <div className="flex h-8 rounded-[10px] bg-[#ECECF0] p-1">
                <button
                  type="button"
                  className="flex-1 rounded-[8px] bg-white text-[12px] font-medium leading-[16px] text-[#0F172B]"
                >
                  题目
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-[8px] text-[12px] font-medium leading-[16px] text-[#62748E] hover:bg-white/60"
                >
                  页面
                </button>
              </div>
            </div>

            <div className="mt-2 px-2">
              <div className="flex h-7 rounded-[10px] bg-[#F1F5F9] p-1 text-[12px] font-medium leading-[15px] text-[#45556C]">
                {['All', `待 (${remainingQ})`, `通 (${passedQ})`, '核 (2)'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="flex-1 rounded-[8px] px-2 hover:bg-white/60"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 h-[calc(667px-36px-36px)] overflow-auto pb-2">
              {Array.from({ length: totalQ }).map((_, idx) => {
                const q = idx + 1;
                const active = q === activeQ;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setActiveQ(q)}
                    className={`flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-[#F8FAFC] ${
                      active ? 'bg-[#F8FAFC]' : ''
                    }`}
                  >
                    <div className="mt-1 h-4 w-4 rounded-full border border-black/10 bg-white" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[12px] font-medium leading-[16px] text-[#0F172B]">
                          Q{q}
                        </div>
                        <div className="rounded-[6px] bg-[#F1F5F9] px-2 py-[1px] text-[10px] leading-[15px] text-[#62748E]">
                          P{Math.ceil(q / 4)}
                        </div>
                      </div>
                      <div className="mt-1 truncate text-[12px] leading-[16px] text-[#62748E]">
                        Calculate the derivative of f(x) = x^2 + 0x. Given …
                      </div>
                    </div>
                    <div className="h-full w-1 rounded bg-transparent" />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* 中间：裁剪预览（2:1734） */}
          <section className="flex w-[457.5px] flex-col border-r border-black/10 bg-[rgba(226,232,240,0.5)]">
            <div className="flex h-10 items-center border-b border-black/10 bg-white pb-px">
              <div className="ml-3 flex h-7 w-[184px] items-center rounded-[8px] bg-[#F1F5F9] px-0">
                <div className="flex w-full items-center gap-0 px-[2px]">
                  <button
                    type="button"
                    className="relative flex h-6 w-[90px] items-center rounded-[8px] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                  >
                    <span className="absolute left-[10px] top-1 h-4 w-4">
                      <Image alt="" src={ICON.crop} fill className="object-contain" />
                    </span>
                    <span className="w-full text-center text-[12px] font-medium leading-[16px] text-[#4F39F6]">
                      题目裁剪
                    </span>
                  </button>
                  <button type="button" className="relative flex h-6 flex-1 items-center rounded-[8px]">
                    <span className="absolute left-[10px] top-1 h-4 w-4">
                      <Image alt="" src={ICON.pageView} fill className="object-contain" />
                    </span>
                    <span className="w-full text-center text-[12px] font-medium leading-[16px] text-[#0F172B]">
                      整页视图
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-1 items-start justify-center overflow-hidden pt-6">
              <div className="w-[409.5px]">
                <div className="flex flex-col gap-4">
                  <div className="relative h-[300px] w-full rounded-[8px] border border-black/10 bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
                    <div className="absolute left-[179.75px] top-[125px] h-12 w-12">
                      <Image alt="" src={ICON.cropPreview} fill className="object-contain" />
                    </div>
                    <div className="absolute left-[130.75px] top-[266px] text-[12px] leading-[16px] text-[#90A1B9]">
                      Crop Image Preview (Q-{activeQ})
                    </div>
                  </div>
                  <button
                    type="button"
                    className="relative flex h-8 w-full items-center justify-center rounded-[8px] border border-[#C6D2FF] bg-white"
                  >
                    <span className="absolute left-[149.75px] top-[7px] h-4 w-4">
                      <Image alt="" src={ICON.locate} fill className="object-contain" />
                    </span>
                    <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[#4F39F6]">
                      在整页中定位
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 右侧：编辑表单（2:1763） */}
          <section className="flex w-[457.5px] flex-col bg-white">
            {/* top bar */}
            <div className="flex h-[48px] items-center justify-between border-b border-black/10 bg-[rgba(248,250,252,0.3)] px-4 pb-px">
              <div className="flex h-9 items-center gap-3">
                <button
                  type="button"
                  className="flex h-9 w-[130px] items-center justify-between rounded-[8px] bg-[#F3F3F5] px-[13px] text-[12px] font-medium leading-[16px] text-[#0F172B]"
                >
                  <span>单选题</span>
                  <span className="relative h-4 w-4">
                    <Image alt="" src={ICON.chevronDown} fill className="object-contain" />
                  </span>
                </button>
                <div className="h-0 w-px bg-black/10" />
                <button type="button" className="relative flex h-8 w-[122.578px] items-center rounded-[8px]">
                  <span className="absolute left-[10px] top-2 h-4 w-4">
                    <Image alt="" src={ICON.ocr} fill className="object-contain" />
                  </span>
                  <span className="ml-8 text-[12px] font-medium leading-[16px] text-[#62748E]">
                    查看 OCR 原文
                  </span>
                </button>
              </div>
              <button type="button" className="relative flex h-8 w-[70px] items-center rounded-[8px]">
                <span className="absolute left-[10px] top-2 h-4 w-4">
                  <Image alt="" src={ICON.reset} fill className="object-contain" />
                </span>
                <span className="ml-9 text-[12px] font-medium leading-[16px] text-[#90A1B9]">重置</span>
              </button>
            </div>

            {/* scroll area */}
            <div className="flex-1 overflow-auto px-6 pt-6">
              {/* Stem */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-[14px] font-medium leading-[14px] tracking-[-0.1504px] text-[#0F172B]">
                      题干 (Stem)
                    </div>
                    <button type="button" className="relative h-5 w-9 rounded-[8px]">
                      <span className="absolute left-[10px] top-[2px] h-4 w-4">
                        <Image alt="" src={ICON.insert} fill className="object-contain" />
                      </span>
                    </button>
                  </div>
                  <div className="text-[12px] leading-[16px] text-[#90A1B9]">支持 LaTeX 公式</div>
                </div>

                <div className="flex h-8 w-full items-center rounded-[14px] bg-[#ECECF0] p-[3px] text-[12px] font-medium leading-[16px]">
                  <button type="button" className="flex-1 rounded-[14px] bg-white py-[5px] text-[#0A0A0A]">
                    编辑
                  </button>
                  <button type="button" className="flex-1 rounded-[14px] py-[5px] text-[#0A0A0A]">
                    预览
                  </button>
                </div>

                <div className="min-h-[120px] w-full rounded-[8px] bg-[#F3F3F5] px-[13px] py-[9px] text-[14px] leading-[22.75px] text-[#0F172B]">
                  {`Calculate the derivative of f(x) = x^2 + 0x.\nGiven that x > 0.`}
                </div>
              </div>

              {/* Options */}
              <div className="mt-6">
                <div className="text-[14px] font-medium leading-[14px] tracking-[-0.1504px] text-[#0F172B]">
                  选项 (Options)
                </div>

                <div className="mt-3 space-y-2">
                  {(['A', 'B', 'C', 'D'] as const).map((k) => (
                    <div key={k} className="flex items-center gap-2">
                      <div className="flex h-9 w-8 items-center justify-center rounded-[4px] border border-black/10 bg-[#F1F5F9] text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[#45556C]">
                        {k}
                      </div>
                      <div className="flex h-9 flex-1 items-center rounded-[8px] bg-[#F3F3F5] px-3 text-[14px] leading-[20px] tracking-[-0.1504px] text-[#0F172B]">
                        {k === 'A' ? `f'(x) = 2x^1 + 0` : k === 'B' ? `f'(x) = x^1 + 0` : k === 'C' ? `f'(x) = 2x^2` : `f'(x) = 1x^1`}
                      </div>
                      <button type="button" className="h-6 w-11 opacity-0" aria-hidden="true">
                        <span className="relative inline-block h-4 w-4">
                          <Image alt="" src={ICON.insertAlt} fill className="object-contain" />
                        </span>
                      </button>
                    </div>
                  ))}

                  <button type="button" className="ml-[-8px] h-8 rounded-[8px] px-3 text-[12px] font-medium leading-[16px] text-[#4F39F6] hover:bg-indigo-50">
                    + 添加选项
                  </button>
                </div>
              </div>

              {/* Answer + Difficulty */}
              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-[14px] font-medium leading-[14px] tracking-[-0.1504px] text-[#0F172B]">
                      参考答案
                    </div>
                    <button type="button" className="relative h-5 w-9 rounded-[8px]">
                      <span className="absolute left-[10px] top-[2px] h-4 w-4">
                        <Image alt="" src={ICON.insertSmall} fill className="object-contain" />
                      </span>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="mt-2 flex h-9 w-full items-center justify-between rounded-[8px] bg-[#F3F3F5] px-[13px] text-[14px] leading-[20px] tracking-[-0.1504px] text-[#0F172B]"
                  >
                    <span>选项 A</span>
                    <span className="relative h-4 w-4">
                      <Image alt="" src={ICON.chevronDown} fill className="object-contain" />
                    </span>
                  </button>
                </div>

                <div>
                  <div className="text-[14px] font-medium leading-[14px] tracking-[-0.1504px] text-[#0F172B]">
                    难度系数
                  </div>
                  <button
                    type="button"
                    className="mt-2 flex h-9 w-full items-center justify-between rounded-[8px] bg-[#F3F3F5] px-[13px] text-[14px] leading-[20px] tracking-[-0.1504px] text-[#0F172B]"
                  >
                    <span>中等 (0.6)</span>
                    <span className="relative h-4 w-4">
                      <Image alt="" src={ICON.chevronDown} fill className="object-contain" />
                    </span>
                  </button>
                </div>
              </div>

              {/* Analysis */}
              <div className="mt-6 pb-24">
                <div className="flex items-center gap-2">
                  <div className="text-[14px] font-medium leading-[14px] tracking-[-0.1504px] text-[#0F172B]">
                    解析 (Analysis)
                  </div>
                  <button type="button" className="relative h-5 w-9 rounded-[8px]">
                    <span className="absolute left-[10px] top-[2px] h-4 w-4">
                      <Image alt="" src={ICON.insertSmall} fill className="object-contain" />
                    </span>
                  </button>
                </div>
                <div className="mt-2 min-h-[100px] w-full rounded-[8px] bg-[#F3F3F5] px-[13px] py-[9px] text-[14px] leading-[20px] tracking-[-0.1504px] text-[#45556C]">
                  Power rule differentiation: d/dx(x^n) = nx^(n-1).
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="flex h-16 items-center justify-between border-t border-black/10 bg-white px-4 pt-px shadow-[0px_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="flex h-9 w-[184px] gap-2">
                <button
                  type="button"
                  disabled={activeQ <= 1}
                  onClick={() => setActiveQ((v) => Math.max(1, v - 1))}
                  className="flex h-9 w-[88px] items-center justify-center gap-2 rounded-[8px] border border-black/10 bg-white disabled:opacity-50"
                >
                  <span className="relative h-4 w-4">
                    <Image alt="" src={ICON.prev} fill className="object-contain" />
                  </span>
                  <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[#45556C]">
                    上一题
                  </span>
                </button>
                <button
                  type="button"
                  disabled={activeQ >= totalQ}
                  onClick={() => setActiveQ((v) => Math.min(totalQ, v + 1))}
                  className="flex h-9 flex-1 items-center justify-center gap-2 rounded-[8px] border border-black/10 bg-white"
                >
                  <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[#45556C]">
                    下一题
                  </span>
                  <span className="relative h-4 w-4">
                    <Image alt="" src={ICON.next} fill className="object-contain" />
                  </span>
                </button>
              </div>

              <div className="flex flex-1 items-center justify-end gap-2">
                <button
                  type="button"
                  className="flex h-10 w-[140px] items-center justify-center gap-2 rounded-[8px] border border-[#A4F4CF] bg-[#D0FAE5] text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[#007A55]"
                >
                  <span className="relative h-4 w-4">
                    <Image alt="" src={ICON.ok} fill className="object-contain" />
                  </span>
                  已通过
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-black/10 bg-white"
                  aria-label="更多"
                >
                  <span className="relative h-4 w-4">
                    <Image alt="" src={ICON.more} fill className="object-contain" />
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


