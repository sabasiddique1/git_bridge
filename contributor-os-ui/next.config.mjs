/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable Turbopack temporarily to fix runtime error
  // experimental: {
  //   turbo: false,
  // },
}

export default nextConfig
