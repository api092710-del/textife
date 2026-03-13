/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['bcryptjs'],
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
