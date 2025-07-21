import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Local Chat - Ollama + Gemma 1B',
  description: 'A local chat application powered by Ollama and Gemma 1B model',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={cn(inter.className, 'h-full antialiased')}>
        {children}
      </body>
    </html>
  );
}