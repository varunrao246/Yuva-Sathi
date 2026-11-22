import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'YUVA SATHI (युवा साथी) — AI Personal Financial Companion for Indian College Students',
  description: 'Your money. Your life. Your साथी. Track expenses, know your safe-to-spend today in INR, check purchases before buying, discover student discounts, and build savings.',
  keywords: [
    'Yuva Sathi',
    'Student Finance India',
    'Pocket Money Tracker',
    'Safe to spend INR',
    'UPI Expense Tracker',
    'Student Discounts India',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN">
      <body className="bg-[#FAF7F0] text-charcoal-900 min-h-screen antialiased selection:bg-lime-300 selection:text-forest-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
