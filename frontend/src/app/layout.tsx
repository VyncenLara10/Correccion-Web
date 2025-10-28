import './globals.css';
import { Toaster } from 'sonner';

const inter = { className: "font-sans" };


export const metadata = {
  title: 'TikalInvest - Plataforma de Trading de Acciones',
  description: 'Invierte en el mercado de valores con TikalInvest. Compra y vende acciones con comisiones ultra bajas.',
  keywords: 'trading, acciones, inversiones, bolsa, Guatemala, TikalInvest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster 
          position="top-right"
          richColors
          closeButton
          theme="dark"
        />
      </body>
    </html>
  );
}