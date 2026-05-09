import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/shared/Providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'HABIX - 피트니스 관리 SaaS',
  description: '트레이너와 회원을 위한 통합 피트니스 관리 플랫폼',
  icons: {
    icon: '/images/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="HABIX" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
