// @ts-nocheck
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Isso evita que o Next tente validar tipos durante o build de páginas estáticas
  swcMinify: true,
};

export default nextConfig;