import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Auth0Provider } from '@/contexts/Auth0Provider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TikalInvest - Plataforma de Inversión',
  description: 'Invierte inteligentemente con TikalInvest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Auth0Provider>
          {children}
          <Toaster position="top-right" richColors />
        </Auth0Provider>
      </body>
    </html>
  );
}