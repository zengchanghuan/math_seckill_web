'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const items = [
  { href: '/paper2bank', label: '项目列表' },
  { href: '/paper2bank/settings', label: '系统设置' },
];

export default function Paper2BankLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white">
        <div className="mx-auto flex h-[65px] max-w-[1230px] items-center justify-between px-6">
          <div className="flex items-center gap-10">
            {/* Brand */}
            <Link href="/paper2bank" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#0F172B]">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[#0F172B] tracking-[-0.0494em]">Paper2Bank</span>
                <span className="text-lg font-normal text-[#90A1B9] tracking-[-0.0494em]">Studio</span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden items-center gap-1 md:flex">
              {items.map((it) => {
                const active = pathname === it.href;
                const iconSrc = it.href === '/paper2bank' ? '/paper2bank/icons/nav-projects.svg' : '/paper2bank/icons/nav-settings.svg';
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={clsx(
                      'inline-flex h-9 items-center gap-4 rounded-lg px-3 text-sm font-medium',
                      active ? 'bg-[#F1F5F9] text-[#0F172B]' : 'text-[#45556C] hover:bg-slate-100'
                    )}
                    style={{ width: it.href === '/paper2bank' ? 112 : undefined }}
                  >
                    <Image src={iconSrc} alt="" width={16} height={16} className="h-4 w-4" />
                    <span className="leading-5">{it.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 md:flex">
              <div className="flex h-9 w-8 items-center justify-center rounded-full border border-[#C6D2FF] bg-[#E0E7FF] text-xs font-bold text-[#432DD7]">
                JD
              </div>
              <div className="relative h-9 w-80">
                <Image
                  src="/paper2bank/icons/nav-search.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="pointer-events-none absolute left-[10px] top-[10px] h-4 w-4"
                />
                <input
                  className="h-9 w-80 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-8 py-1 pl-9 text-sm text-[#0F172B] placeholder:text-[#717182] outline-none focus:ring-4 focus:ring-indigo-100"
                  placeholder="搜索项目 / 文件名 / Import ID"
                />
                <Image
                  src="/paper2bank/icons/nav-x.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="pointer-events-none absolute right-[10px] top-[10px] h-4 w-4 opacity-60"
                />
              </div>
              <button
                type="button"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
                aria-label="通知"
              >
                <Image src="/paper2bank/icons/nav-bell.svg" alt="" width={16} height={16} className="h-4 w-4" />
                <span className="absolute right-[8px] top-[8px] h-2 w-2 rounded-full border border-white bg-[#FF2056]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1230px] px-8 pt-8 pb-10">{children}</main>
    </div>
  );
}


