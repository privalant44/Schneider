/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  // Optimisations pour le développement
  experimental: {
    // Améliore les performances de compilation
    optimizePackageImports: ['lucide-react'],
  },
  // Optimisations webpack
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Optimisations pour le développement
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
  // Compilation plus rapide
  swcMinify: true,
  // Réduit la compilation TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  }
}

module.exports = nextConfig
