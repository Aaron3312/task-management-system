/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Deshabilitar ESLint durante la compilación
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Deshabilitar la comprobación de tipos de TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configurar el proxy para la API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8081/:path*', // Proxy a tu API
      },
    ];
  },
};

module.exports = nextConfig;