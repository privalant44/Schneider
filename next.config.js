/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration des images
  images: {
    domains: ['localhost'],
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },
  
  // Optimisations expérimentales
  experimental: {
    optimizePackageImports: ['lucide-react'],
    serverComponentsExternalPackages: ['multer'],
  },
  
  // Configuration webpack
  webpack: (config, { dev, isServer }) => {
    // Optimisations pour le développement
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    
    // Optimisations pour la production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      }
    }
    
    return config
  },
  
  // Compilation optimisée
  swcMinify: true,
  
  // Configuration TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configuration ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Configuration de sortie
  output: 'standalone',
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Redirections
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/sessions',
        permanent: false,
      },
    ]
  },
  
  // Variables d'environnement publiques
  env: {
    APP_NAME: 'Questionnaire Schneider',
    APP_VERSION: '1.0.0',
  },
}

module.exports = nextConfig
