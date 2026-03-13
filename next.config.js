/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['bcryptjs'],
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors are caught in dev. Don't block production builds.
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
