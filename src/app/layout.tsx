import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/BackendAuthContext';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JAI-VIER - Sistema de Gestión de Tareas',
  description: 'Sistema de gestión de tareas estilo Jira con patrones de diseño en TypeScript. Organiza tu trabajo de manera eficiente.',
  keywords: ['gestión de tareas', 'productividad', 'jira', 'typescript', 'organización'],
  authors: [{ name: 'JAI-VIER Team' }],
  openGraph: {
    title: 'JAI-VIER - Sistema de Gestión de Tareas',
    description: 'Sistema de gestión de tareas estilo Jira con patrones de diseño en TypeScript. Organiza tu trabajo de manera eficiente.',
    url: 'http://jai-vier.online',
    siteName: 'JAI-VIER',
    images: [
      {
        url: 'http://jai-vier.online/favicon.png', // Usando favicon temporalmente
        width: 512,
        height: 512,
        alt: 'JAI-VIER - Sistema de Gestión de Tareas',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'JAI-VIER - Sistema de Gestión de Tareas',
    description: 'Sistema de gestión de tareas estilo Jira con patrones de diseño en TypeScript.',
    images: ['http://jai-vier.online/favicon.png'],
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  metadataBase: new URL('http://jai-vier.online'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Fallback metadatos para WhatsApp */}
        <meta property="og:title" content="JAI-VIER - Sistema de Gestión de Tareas" />
        <meta property="og:description" content="Sistema de gestión de tareas estilo Jira con patrones de diseño en TypeScript" />
        <meta property="og:image" content="http://jai-vier.online/favicon.png" />
        <meta property="og:url" content="http://jai-vier.online" />
        <meta property="og:type" content="website" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}