import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'paper2bank-v2',
  description: 'Extractor UI (Qwen OCR) + DeepSeek vs SymPy solve compare.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
