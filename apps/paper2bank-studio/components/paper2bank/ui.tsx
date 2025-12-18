'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export function Card({
  title,
  description,
  right,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[10px] border border-slate-200 bg-white shadow-[0_1px_2px_-1px_rgba(0,0,0,0.1),0_1px_3px_0_rgba(0,0,0,0.1)]">
      {(title || description || right) && (
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 ease-in-out active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed';
  const variants: Record<string, string> = {
    primary: 'bg-primary-600 text-white shadow-indigo hover:bg-primary-700',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes: Record<string, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  };
  return <button className={clsx(base, variants[variant], sizes[size], className)} {...props} />;
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        'min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100',
        className
      )}
      {...props}
    />
  );
}

export function Badge({ tone = 'gray', children }: { tone?: 'gray' | 'green' | 'yellow' | 'red' | 'indigo'; children: ReactNode }) {
  const tones: Record<string, string> = {
    gray: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    indigo: 'bg-primary-50 text-primary-700',
  };
  return <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', tones[tone])}>{children}</span>;
}

export function Callout({
  tone = 'gray',
  title,
  children,
}: {
  tone?: 'gray' | 'info' | 'warning' | 'danger' | 'success';
  title?: ReactNode;
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    gray: 'border-slate-200 bg-slate-50 text-slate-700',
    info: 'border-primary-200 bg-primary-50 text-primary-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-red-200 bg-red-50 text-red-900',
    success: 'border-green-200 bg-green-50 text-green-900',
  };
  return (
    <div className={clsx('rounded-2xl border px-4 py-3 text-sm', tones[tone])}>
      {title && <div className="mb-1 font-semibold">{title}</div>}
      <div className="text-sm leading-6">{children}</div>
    </div>
  );
}


