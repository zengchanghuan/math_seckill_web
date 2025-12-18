import type { Metadata } from 'next';
import Paper2BankLayout from '@/components/paper2bank/Paper2BankLayout';

export const metadata: Metadata = {
  title: 'Paper2Bank Studio',
  description: '题库导入与校对工作台（Paper2Bank Studio）。',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Paper2BankLayout>{children}</Paper2BankLayout>;
}




