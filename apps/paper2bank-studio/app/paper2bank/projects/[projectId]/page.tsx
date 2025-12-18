'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Callout } from '@/components/paper2bank/ui';
import {
  createImport,
  getProject,
  listProjectImports,
  type ApiError,
  type ImportItem,
  type Project,
} from '@/lib/paper2bank/api';
import { readClientConfig } from '@/lib/paper2bank/config';

const FIGMA_ICON_DIR = '/paper2bank/icons/figma-2-764';

// 2:764 / 2:766 / 2:1073 / 2:1086 / 2:1096 资产（由官方 MCP 导出并落盘到 public）
const ICON = {
  back: `${FIGMA_ICON_DIR}/dde6100b1c25930e6f44de7efd6917d4eebd944f.svg`,
  badgeSuccess: `${FIGMA_ICON_DIR}/91b67871913dea8dbf71726921eab4b2f840495a.svg`,
  importCount: `${FIGMA_ICON_DIR}/262d9d6ac1a1c95ffba518df001eb2fc1ecfd43f.svg`,
  file: `${FIGMA_ICON_DIR}/9df826fd3790edff6269008e5734ca139476918a.svg`,
  calendar: `${FIGMA_ICON_DIR}/7580c432a4c3a671bc1e36912a39ffb5cd9e20bc.svg`,
  pagesA: `${FIGMA_ICON_DIR}/7b268901753df571597dce0d6f22c1373ed6de93.svg`,
  pagesB: `${FIGMA_ICON_DIR}/a12d408533e6047561a8562f8db4a4e7660cc5cd.svg`,
  issue: `${FIGMA_ICON_DIR}/4cd1e723ed02495a436252450a9f8b7674395d6e.svg`,
  chevron: `${FIGMA_ICON_DIR}/877b88344dfb55044767f38378bf67083fa118fe.svg`,
  ok: `${FIGMA_ICON_DIR}/ee96220eeb79022b286174e4592c88fa8fbfc97f.svg`,

  uploadVectorA: `${FIGMA_ICON_DIR}/1294b336e8438a93b9312040602783c0a6e23c4f.svg`,
  uploadVectorB: `${FIGMA_ICON_DIR}/e518f1d107e614c9a44854585c5d24c665e8894e.svg`,
  uploadVectorC: `${FIGMA_ICON_DIR}/a3f43baab1bfaffd6b80b7c53d1ff8f4f3b9feb2.svg`,
  bestPractice: `${FIGMA_ICON_DIR}/fa1ae90476fa01f502556bee4e8240e8863dfa9f.svg`,
  owner: `${FIGMA_ICON_DIR}/637f74fd76dd48b2a158626e3f2307988f693d3d.svg`,
  createdAt: `${FIGMA_ICON_DIR}/1a15bc22280b16ed0934ab8578b0a3c6957f51a1.svg`,
};

function toneByStatus(status?: string) {
  const s = (status || '').toLowerCase();
  if (['succeeded', 'success', 'done', 'completed'].some((k) => s.includes(k))) return 'green';
  if (['failed', 'error'].some((k) => s.includes(k))) return 'red';
  if (['expired'].some((k) => s.includes(k))) return 'gray';
  if (['running', 'processing'].some((k) => s.includes(k))) return 'indigo';
  if (['pending', 'queued'].some((k) => s.includes(k))) return 'yellow';
  return 'gray';
}

function statusStyle(tone: string) {
  switch (tone) {
    case 'green':
      return { bg: '#ECFDF5', border: '#A4F4CF', text: '#007A55', label: '成功' };
    case 'indigo':
      return { bg: '#EFF6FF', border: '#BEDBFF', text: '#1447E6', label: '进行中' };
    case 'red':
      return { bg: '#FFF1F2', border: '#FFCCD3', text: '#C70036', label: '失败' };
    case 'gray':
      return { bg: '#F3F4F6', border: '#E5E7EB', text: '#6A7282', label: '已过期' };
    case 'yellow':
      return { bg: '#FFFBEB', border: '#FEF3C6', text: '#E17100', label: '待处理' };
    default:
      return { bg: '#F3F4F6', border: '#E5E7EB', text: '#6A7282', label: '—' };
  }
}

function formatErr(e: any) {
  const err = e as ApiError;
  return {
    title: `${err.code || 'ERROR'}（HTTP ${err.status || '?'}）`,
    message: err.message || '请求失败',
    traceId: err.traceId,
  };
}

function fmtDate(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtDateShort(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function pickDisplayName(imp: ImportItem): string {
  const anyImp = imp as any;
  return (
    anyImp.file_name ||
    anyImp.filename ||
    anyImp.original_filename ||
    anyImp.object_name ||
    `${imp.id}`
  );
}

function pickPages(imp: ImportItem): number | null {
  const anyImp = imp as any;
  const v = anyImp.page_count ?? anyImp.pages ?? anyImp.pdf_pages;
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function UploadIcon24() {
  // 对齐官方 MCP `2:1075` 的三个 vector 叠加
  return (
    <div className="relative h-6 w-6 overflow-hidden">
      <div className="absolute bottom-[12.5%] left-1/2 right-1/2 top-[54.17%]">
        <div className="absolute inset-[-12.5%_-1px]">
          <Image alt="" src={ICON.uploadVectorA} fill className="object-contain" />
        </div>
      </div>
      <div className="absolute inset-[12.51%_8.33%_32.32%_8.34%]">
        <div className="absolute inset-[-7.55%_-5%]">
          <Image alt="" src={ICON.uploadVectorB} fill className="object-contain" />
        </div>
      </div>
      <div className="absolute inset-[54.17%_33.33%_29.17%_33.33%]">
        <div className="absolute inset-[-25%_-12.5%]">
          <Image alt="" src={ICON.uploadVectorC} fill className="object-contain" />
        </div>
      </div>
    </div>
  );
}

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const cfg = useMemo(() => readClientConfig(), []);
  const projectId = params.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [imports, setImports] = useState<ImportItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<any>(null);

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const [p, imps] = await Promise.all([
        getProject(projectId),
        listProjectImports(projectId),
      ]);
      setProject(p);
      setImports(Array.isArray(imps) ? imps : []);
    } catch (e) {
      // 兼容：后端可能没实现某些接口
      setProject(null);
      setImports(null);
      setErr(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function onUpload(file: File) {
    setUploading(true);
    setErr(null);
    try {
      const imp = await createImport(projectId, file);
      // 立即跳详情；列表刷新属于 best-effort
      window.location.href = `/paper2bank/imports/${encodeURIComponent(imp.id)}`;
    } catch (e) {
      setErr(e);
    } finally {
      setUploading(false);
    }
  }

  const importList = (imports || []).slice().sort((a, b) => {
    const aa = new Date((a as any).created_at || (a as any).createdAt || 0).getTime();
    const bb = new Date((b as any).created_at || (b as any).createdAt || 0).getTime();
    return bb - aa;
  });
  const latestStatus = importList[0]?.status || '';
  const latestTone = toneByStatus(latestStatus);
  const latest = statusStyle(latestTone);
  const importCount = imports ? imports.length : 0;

  return (
    <div className="w-full">
      {/* 返回项目列表（2:767，x=-8） */}
      <div className="-ml-2">
        <Link
          href="/paper2bank"
          className="inline-flex h-8 w-[130px] items-center rounded-[8px] text-[#62748E] hover:bg-slate-100"
        >
          <span className="relative ml-[10px] mr-[10px] h-4 w-4">
            <Image alt="" src={ICON.back} fill className="object-contain" />
          </span>
          <span className="text-[14px] font-medium leading-[20px] tracking-[-0.1504px]">
            返回项目列表
          </span>
        </Link>
      </div>

      {err && (
        <div className="mt-4">
          <Callout tone="danger" title={formatErr(err).title}>
            <div className="space-y-1">
              <div>{formatErr(err).message}</div>
              {formatErr(err).traceId && <div className="text-xs opacity-80">trace_id: {formatErr(err).traceId}</div>}
              <div className="text-xs opacity-80">baseUrl: {cfg.baseUrl}</div>
            </div>
          </Callout>
        </div>
      )}

      {/* 头部（2:772，y=56） */}
      <div className="mt-[56px]">
          <div className="flex items-center gap-3">
            <div className="text-[30px] font-bold leading-[36px] tracking-[-0.3545px] text-[#0F172B]">
              {project?.name || `Project ${projectId}`}
            </div>
            {latestStatus ? (
              <span
                className="inline-flex h-6 items-center gap-2 rounded-[8px] border px-[10px] text-[12px] font-medium leading-[16px]"
                style={{ background: latest.bg, borderColor: latest.border, color: latest.text }}
              >
                {latestTone === 'green' ? (
                  <span className="relative h-3 w-3">
                    <Image alt="" src={ICON.badgeSuccess} fill className="object-contain" />
                  </span>
                ) : null}
                {latest.label}
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-[18px] font-normal leading-[28px] tracking-[-0.4395px] text-[#62748E]">
            {(project as any)?.description || 'Importing 2024 final exam questions from PDF source.'}
          </div>
          <div className="mt-4 inline-flex h-7 items-center rounded-[4px] bg-[#F1F5F9] px-2">
            <span className="relative mr-2 h-[14px] w-[14px]">
              <Image alt="" src={ICON.importCount} fill className="object-contain" />
            </span>
            <span className="text-[14px] font-normal leading-[20px] tracking-[-0.1504px] text-[#62748E]">
              {importCount} 个导入任务
            </span>
          </div>
        </div>

      {/* 分割线（2:791，y=196） */}
      <div className="mt-6 h-px w-full bg-[rgba(0,0,0,0.1)]" />

      {/* 两栏（左 766.664 / 右 367.336 / gap 32，y=221） */}
      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        {/* 导入历史（2:792） */}
        <section className="w-full lg:w-[766.6640625px]">
          <div className="rounded-[14px] border border-[#E2E8F0] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <div className="border-b border-[#F1F5F9] bg-[rgba(248,250,252,0.5)] px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-[16px] font-semibold leading-[24px] tracking-[-0.3125px] text-[#0F172B]">
                    导入历史
                  </div>
                  <div className="rounded-full bg-[rgba(226,232,240,0.5)] px-2 py-[3px] text-[12px] font-medium leading-[16px] text-[#62748E]">
                    {imports ? `${imports.length} 个文件` : '—'}
                  </div>
                </div>
              </div>

              <div>
                {imports === null ? (
                  <div className="p-6">
                    <Callout tone="warning" title="列表接口不可用或鉴权失败">
                      请先到“系统设置”配置 baseUrl 与 API Key；或稍后重试。
                    </Callout>
                  </div>
                ) : importList.length === 0 ? (
                  <div className="p-6 text-[14px] leading-[20px] text-[#62748E]">暂无导入记录。</div>
                ) : (
                  <div>
                    {importList.map((imp, idx) => {
                      const name = pickDisplayName(imp);
                      const pages = pickPages(imp);
                      const createdAt = (imp as any).created_at || (imp as any).createdAt;
                      const tone = toneByStatus(imp.status);
                      const st = statusStyle(tone);
                      const issueCount = Number((imp as any).issue_count || 0);
                      const showPagesIcon = idx === 0 ? ICON.pagesA : ICON.pagesB;

                      return (
                        <Link
                          key={imp.id}
                          href={`/paper2bank/imports/${encodeURIComponent(imp.id)}`}
                          className="flex h-[73px] items-center justify-between border-b border-[#F1F5F9] px-4 last:border-b-0 hover:bg-white/60"
                        >
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#E0E7FF] bg-[#EEF2FF]">
                              <div className="relative h-5 w-5">
                                <Image alt="" src={ICON.file} fill className="object-contain" />
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="truncate text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[#0F172B]">
                                  {name}
                                </div>
                                <span
                                  className="inline-flex h-5 items-center justify-center rounded-[8px] border px-[7px] py-px text-[10px] font-medium leading-[15px] tracking-[0.1172px]"
                                  style={{ background: st.bg, borderColor: st.border, color: st.text }}
                                >
                                  {st.label}
                                </span>
                              </div>

                              <div className="mt-1 flex items-center gap-3">
                                <span className="inline-flex items-center gap-1 text-[12px] leading-[16px] text-[#62748E]">
                                  <span className="relative h-3 w-3">
                                    <Image alt="" src={ICON.calendar} fill className="object-contain" />
                                  </span>
                                  {fmtDate(createdAt)}
                                </span>
                                <span className="h-3 w-px bg-[#E2E8F0]" />
                                <span className="inline-flex items-center gap-1 text-[12px] leading-[16px] text-[#90A1B9]">
                                  <span className="relative h-3 w-3">
                                    <Image alt="" src={showPagesIcon} fill className="object-contain" />
                                  </span>
                                  {pages !== null ? `${pages} 页` : '—'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            {issueCount > 0 ? (
                              <div className="inline-flex h-[26px] items-center gap-[6px] rounded-full border border-[rgba(254,243,198,0.5)] bg-[#FFFBEB] pl-px pr-[9px] py-px">
                                <span className="relative ml-2 h-[14px] w-[14px]">
                                  <Image alt="" src={ICON.issue} fill className="object-contain" />
                                </span>
                                <span className="text-[12px] font-semibold leading-[16px] text-[#E17100]">
                                  {issueCount} 个疑点
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 text-[12px] leading-[16px] text-[#90A1B9]">
                                <span className="relative h-3 w-3">
                                  <Image alt="" src={ICON.ok} fill className="object-contain" />
                                </span>
                                无疑点
                              </div>
                            )}

                            <div className="flex h-8 w-8 items-center justify-center rounded-[8px]">
                              <span className="relative h-4 w-4">
                                <Image alt="" src={ICON.chevron} fill className="object-contain" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
        </section>

        {/* 右侧：上传文档（2:1066/2:1073/2:1086） + 项目信息（2:1096） */}
        <section className="w-full lg:w-[367.3359375px]">
          <div className="rounded-[14px] border border-[#E2E8F0] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
            <div className="px-6 pb-0 pt-6">
              <div className="text-[20px] font-semibold leading-[28px] text-[#0F172B]">上传文档</div>
              <div className="mt-1 text-[14px] font-normal leading-[24px] text-[#62748E]">
                从 PDF 试卷或扫描图片中导入题目。
              </div>
            </div>

            <div className="px-6 pb-6 pt-6">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    onUpload(f);
                    e.currentTarget.value = '';
                  }}
                />

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="relative flex w-full flex-col items-center justify-center gap-4 rounded-[10px] border-2 border-[#E2E8F0] p-[2px] disabled:opacity-50"
                >
                  <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F5F9]">
                    <UploadIcon24 />
                  </div>
                  <div className="h-6 w-[180.1875px]">
                    <span className="text-[16px] font-semibold leading-[24px] tracking-[-0.3125px] text-[#4F39F6]">
                      {uploading ? '上传中…' : '点击上传'}
                    </span>
                    <span className="text-[16px] font-normal leading-[24px] tracking-[-0.3125px] text-[#62748E]">
                      或拖拽文件至此
                    </span>
                  </div>
                  <div className="mb-7 text-[12px] font-normal leading-[16px] text-[#90A1B9]">
                    支持 PDF, PNG, JPG (最大 10MB)
                  </div>
                </button>

                <div className="mt-4 rounded-[8px] border border-[#FEF3C6] bg-[#FFFBEB]">
                  <div className="flex gap-2 px-3 py-3">
                    <span className="relative mt-[2px] h-4 w-4 shrink-0">
                      <Image alt="" src={ICON.bestPractice} fill className="object-contain" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="text-[12px] font-medium leading-[16px] text-[#973C00]">
                        最佳实践
                      </div>
                      <div className="text-[12px] font-normal leading-[16px] text-[#973C00] opacity-90">
                        请确保扫描文档清晰可读。水印可能会影响提取质量。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <div className="mt-6 rounded-[10px] border border-[#F1F5F9] bg-[#F8FAFC] px-[17px] pb-px pt-[17px]">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-normal leading-[20px] tracking-[-0.1504px] text-[#62748E]">
                  <span className="relative h-[14px] w-[14px]">
                    <Image alt="" src={ICON.owner} fill className="object-contain" />
                  </span>
                  负责人
                </div>
                <div className="text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[#314158]">
                  {(project as any)?.owner_name || '-'}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-normal leading-[20px] tracking-[-0.1504px] text-[#62748E]">
                  <span className="relative h-[14px] w-[14px]">
                    <Image alt="" src={ICON.createdAt} fill className="object-contain" />
                  </span>
                  创建时间
                </div>
                <div className="text-[14px] font-medium leading-[20px] tracking-[-0.1504px] text-[#314158]">
                  {fmtDateShort((project as any)?.created_at || (project as any)?.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


