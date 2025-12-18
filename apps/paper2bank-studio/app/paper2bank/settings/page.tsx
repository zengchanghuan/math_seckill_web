'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Callout } from '@/components/paper2bank/ui';
import { readClientConfig, writeClientConfig } from '@/lib/paper2bank/config';
import { healthz } from '@/lib/paper2bank/api';

export default function Paper2BankSettingsPage() {
  const initial = useMemo(() => readClientConfig(), []);
  const [baseUrl, setBaseUrl] = useState(initial.baseUrl);
  const [apiKey, setApiKey] = useState(initial.apiKey || '');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<any>(null);

  function onSaveOnly() {
    writeClientConfig({ baseUrl: baseUrl.trim(), apiKey: apiKey.trim() || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  async function onSaveAndVerify() {
    setTesting(true);
    setTestResult(null);
    setTestError(null);
    try {
      // 先保存再测试，避免“测试的不是当前输入”
      writeClientConfig({ baseUrl: baseUrl.trim(), apiKey: apiKey.trim() || undefined });
      const res = await healthz();
      setTestResult(res);
      setSaved(true);
      setTimeout(() => setSaved(false), 1200);
    } catch (e) {
      setTestError(e);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[768px] space-y-6">
      <div className="space-y-1">
        <h1 className="text-[30px] font-bold leading-[1.2] tracking-tight text-[#0F172B]">设置</h1>
        <p className="text-base text-[#62748E]">管理 Teacher API 连接及其他全局偏好设置。</p>
      </div>

      <div className="h-px w-full bg-black/10" />

      {saved && <Callout tone="success">已保存到本地（localStorage）。</Callout>}

      {/* API 配置 */}
      <section className="overflow-hidden rounded-[14px] border border-black/10 bg-white">
        <div className="px-6 pt-6">
          <div className="text-base font-medium leading-4 text-[#0A0A0A]">API 配置</div>
          <div className="mt-2 text-base text-[#717182]">配置后端服务连接。</div>
        </div>
        <div className="px-6 py-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[#0A0A0A]">
                <span className="inline-block h-4 w-4 rounded bg-transparent" />
                Teacher API Base URL
              </div>
              <div className="flex h-9 items-center rounded-lg bg-[#F3F3F5] px-3">
                <input
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:8000"
                  className="w-full bg-transparent text-sm text-[#0A0A0A] outline-none placeholder:text-[#717182]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-[#0A0A0A]">
                <span className="inline-block h-4 w-4 rounded bg-transparent" />
                API Key
              </div>
              <div className="flex h-9 items-center rounded-lg bg-[#F3F3F5] px-3">
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  type="password"
                  autoComplete="off"
                  className="w-full bg-transparent text-sm text-[#0A0A0A] outline-none placeholder:text-[#717182]"
                />
              </div>
              <div className="flex items-start gap-2 text-[11px] leading-[1.5] text-[#62748E]">
                <span className="mt-[2px] inline-block h-3 w-3 rounded border border-[#90A1B9]" />
                <div>
                  Key 仅存储在您的本地浏览器中 (MVP)。它不会通过 URL 参数传递，仅通过 Headers 传输。
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex h-[77px] items-center justify-end border-t border-[#F1F5F9] bg-[#F8FAFC] px-6">
          <button
            type="button"
            onClick={onSaveAndVerify}
            disabled={testing}
            className="inline-flex h-9 w-[126px] items-center gap-2 rounded-lg bg-[#030213] px-3 text-sm font-medium text-white opacity-80 hover:opacity-90 disabled:opacity-50"
          >
            <Image src="/paper2bank/icons/save-verify.svg" alt="" width={16} height={16} />
            {testing ? '验证中…' : '保存并验证'}
          </button>
          {/* 保留：纯保存能力（不影响设计），目前隐藏 */}
          <button type="button" className="hidden" onClick={onSaveOnly} />
        </div>
      </section>

      {/* 系统常量 */}
      <section className="overflow-hidden rounded-[14px] border border-black/10 bg-white">
        <div className="px-6 pt-6">
          <div className="text-base font-medium leading-6 text-[#0A0A0A]">系统常量</div>
        </div>
        <div className="px-6 py-6 space-y-3">
          <div className="flex h-10 items-center justify-between rounded-lg border border-[#F1F5F9] bg-[#F8FAFC] px-3">
            <div className="text-sm font-medium text-[#314158]">下载模式</div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-[26px] items-center rounded border border-[#E2E8F0] bg-white px-2 text-xs text-[#4F39F6]">
                Proxy
              </span>
              <span className="text-xs font-medium text-[#62748E]">（当前）</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] leading-[1.5] text-[#90A1B9]">
            <Image src="/paper2bank/icons/info.svg" alt="" width={12} height={12} />
            <span>Presigned URL 模式为 TODO（未来优化大文件下载成本），不可切换。</span>
          </div>
        </div>
      </section>

      {(testResult || testError) && (
        <div>
          {testError ? (
            <Callout tone="danger" title="验证失败">
              <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(testError, null, 2)}</pre>
            </Callout>
          ) : (
            <Callout tone="info" title="验证成功">
              <pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(testResult, null, 2)}</pre>
            </Callout>
          )}
        </div>
      )}
    </div>
  );
}


