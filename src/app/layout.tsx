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
    url: 'https://jai-vier.online',
    siteName: 'JAI-VIER',
    images: [
      {
        url: 'https://jai-vier.online/og-image.jpg', // Necesitas crear esta imagen
        width: 1200,
        height: 630,
        alt: 'JAI-VIER - Sistema de Gestión de Tareas',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JAI-VIER - Sistema de Gestión de Tareas',
    description: 'Sistema de gestión de tareas estilo Jira con patrones de diseño en TypeScript.',
    images: ['https://jai-vier.online/og-image.jpg'], // La misma imagen
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  metadataBase: new URL('https://jai-vier.online'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}