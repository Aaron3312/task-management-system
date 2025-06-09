import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/BackendAuthContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <title>JAI-VIER - Sistema de Gestión de Tareas</title>
        <meta name="description" content="Sistema de gestión de tareas estilo Jira con patrones de diseño en TypeScript" />
        
        {/* Open Graph para WhatsApp */}
        <meta property="og:title" content="JAI-VIER - Sistema de Gestión de Tareas" />
        <meta property="og:description" content="Sistema de gestión de tareas estilo Jira con patrones de diseño en TypeScript" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="http://jai-vier.online" />
        <meta property="og:image" content="http://jai-vier.online/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="JAI-VIER" />
        
        <link rel="icon" href="/favicon.png" />
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