/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration des images
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  
  // Configuration TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configuration ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Variables d'environnement publiques
  env: {
    APP_NAME: 'Questionnaire Schneider',
    APP_VERSION: '1.0.0',
  },
}

module.exports = nextConfig

