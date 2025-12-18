'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, Badge, Callout, Input } from '@/components/paper2bank/ui';
import { createProject, listProjects, type ApiError, type Project } from '@/lib/paper2bank/api';
import { readClientConfig } from '@/lib/paper2bank/config';

function formatErr(e: any) {
  const err = e as ApiError;
  return {
    title: `${err.code || 'ERROR'}（HTTP ${err.status || '?'}）`,
    message: err.message || '请求失败',
    traceId: err.traceId,
  };
}

export default function Paper2BankHome() {
  const cfg = useMemo(() => readClientConfig(), []);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<any>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await listProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      setProjects(null);
      setErr(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate() {
    if (!name.trim()) return;
    setCreating(true);
    setErr(null);
    try {
      const p = await createProject({ name: name.trim(), description: desc.trim() || undefined });
      setName('');
      setDesc('');
      // 尽量刷新列表；若后端没实现 list，也不影响直接跳详情
      await load();
      window.location.href = `/paper2bank/projects/${encodeURIComponent(p.id)}`;
    } catch (e) {
      setErr(e);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#0F172B] tracking-tight">项目列表</h1>
          <p className="text-base text-[#62748E]">管理您的题库导入任务。</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={cfg.apiKey ? 'green' : 'yellow'}>{cfg.apiKey ? '已配置 API Key' : '未配置 API Key'}</Badge>
          <Link href="/paper2bank/settings" className="text-sm font-medium text-primary-700 hover:underline">
            去设置
          </Link>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-medium text-[#0A0A0A] hover:bg-slate-50"
          >
            <Image src="/paper2bank/icons/filter.svg" alt="" width={16} height={16} className="h-4 w-4" />
            筛选
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#0F172B] px-4 text-sm font-medium text-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_0_rgba(0,0,0,0.1)] hover:opacity-95"
          >
            <Image src="/paper2bank/icons/plus.svg" alt="" width={16} height={16} className="h-4 w-4" />
            新建项目
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent hover:bg-slate-100 disabled:opacity-50"
            aria-label="刷新"
            title="刷新"
          >
            <RefreshCw className={`h-4 w-4 text-[#45556C] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {err && (
        <Callout tone="danger" title={formatErr(err).title}>
          <div className="space-y-1">
            <div>{formatErr(err).message}</div>
            {formatErr(err).traceId && <div className="text-xs opacity-80">trace_id: {formatErr(err).traceId}</div>}
            <div className="text-xs opacity-80">baseUrl: {cfg.baseUrl}</div>
          </div>
        </Callout>
      )}

      <Card
        title={null}
        description={null}
      >
        {projects === null ? (
          <Callout tone="warning" title="列表接口不可用或鉴权失败">
            你仍然可以在“系统设置”里配置 baseUrl 与 API Key；或直接访问 <span className="font-mono">/paper2bank/projects/&lt;projectId&gt;</span>。
          </Callout>
        ) : projects.length === 0 ? (
          <div className="text-sm text-slate-600">暂无项目。</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[1164px]">
              {/* Table Header */}
              <div className="grid h-10 grid-cols-[367.5px_207.4px_149.3px_265.5px_174.2px] bg-[rgba(248,250,252,0.5)]">
                {['项目详情', '最近导入状态', '导入数量', '创建时间', '操作'].map((h, i) => (
                  <div
                    key={h}
                    className={i === 4 ? 'flex items-center justify-end px-2 text-sm font-semibold text-[#314158]' : 'flex items-center px-2 text-sm font-semibold text-[#314158]'}
                  >
                    {h}
                  </div>
                ))}
              </div>
              {/* Rows */}
              <div>
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="grid h-[81px] grid-cols-[367.5px_207.4px_149.3px_265.5px_174.2px] border-b border-[#F1F5F9]"
                  >
                    <div className="flex flex-col justify-center px-2">
                      <div className="text-sm font-semibold text-[#0F172B]">{p.name}</div>
                      <div className="text-xs text-[#62748E]">
                        <span className="font-mono">{p.id}</span>
                        {p.description ? ` · ${p.description}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center px-2">
                      <span className="inline-flex h-[22px] items-center rounded-lg border border-[#BEDBFF] bg-[#EFF6FF] px-2 text-xs font-medium text-[#314158]">
                        -
                      </span>
                    </div>
                    <div className="flex items-center px-2 text-sm text-[#314158]">-</div>
                    <div className="flex items-center px-2 text-sm text-[#314158]">{p.created_at || '-'}</div>
                    <div className="flex items-center justify-end gap-2 px-2">
                      <Link
                        href={`/paper2bank/projects/${encodeURIComponent(p.id)}`}
                        className="inline-flex h-8 items-center rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm font-medium text-[#0F172B] hover:bg-slate-50"
                      >
                        打开
                      </Link>
                      <Link
                        href={`/paper2bank/projects/${encodeURIComponent(p.id)}`}
                        className="inline-flex h-8 items-center rounded-lg bg-[#0F172B] px-3 text-sm font-medium text-white hover:opacity-95"
                      >
                        导入
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Create Project Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-[10px] border border-[#E2E8F0] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <div className="text-base font-semibold text-[#0F172B]">新建项目</div>
                <div className="mt-1 text-sm text-[#62748E]">创建一个 Project，用于承载 imports。</div>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-slate-100"
                aria-label="关闭"
                onClick={() => setShowCreate(false)}
              >
                <Image src="/paper2bank/icons/nav-x.svg" alt="" width={16} height={16} className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <div className="mb-1 text-sm font-medium text-[#314158]">名称</div>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：高数一轮复习" />
              </div>
              <div>
                <div className="mb-1 text-sm font-medium text-[#314158]">描述（可选）</div>
                <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="例如：期末冲刺" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="inline-flex h-9 items-center rounded-lg border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#0F172B] hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={onCreate}
                  disabled={!name.trim() || creating}
                  className="inline-flex h-9 items-center rounded-lg bg-[#0F172B] px-4 text-sm font-medium text-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_0_rgba(0,0,0,0.1)] hover:opacity-95 disabled:opacity-50"
                >
                  {creating ? '创建中…' : '创建'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


