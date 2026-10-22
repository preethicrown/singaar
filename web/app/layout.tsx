import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SINGAAR: find your bridal artist',
  description: 'Describe your look and compare independent women artists and salons with prices and availability.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
