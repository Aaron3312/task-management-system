// src/app/auth/login/page.tsx
import LoginForm from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JAI-VIER - Sistema de Gestión de Tareas',
  description: 'Sistema de gestión de tareas estilo Jira con patrones de diseño en TypeScript',
  openGraph: {
    title: 'JAI-VIER - Sistema de Gestión de Tareas',
    description: 'Sistema de gestión de tareas estilo Jira con patrones de diseño en TypeScript',
    type: 'website',
    url: 'http://jai-vier.online',
    images: [
      {
        url: 'http://jai-vier.online/favicon.png',
        width: 512,
        height: 512,
        alt: 'JAI-VIER Logo',
      },
    ],
  },
};

export default function LoginPage() {
  return (
    <>
      <meta property="og:title" content="JAI-VIER - Sistema de Gestión de Tareas" />
      <meta property="og:description" content="Sistema de gestión de tareas estilo Jira" />
      <meta property="og:image" content="http://jai-vier.online/favicon.png" />
      <meta property="og:url" content="http://jai-vier.online" />
      <meta property="og:type" content="website" />
      <LoginForm />
    </>
  );
}