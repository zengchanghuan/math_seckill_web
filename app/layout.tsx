import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '高数衔接刷题 - 高中→大学数学衔接',
  description: '精选广东专升本/高数真题 + 关键基础知识，用最少的时间搞懂高数最常考的部分。你的私塾教练。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
