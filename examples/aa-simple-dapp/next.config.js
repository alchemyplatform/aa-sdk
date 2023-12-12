/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: { appDir: true },
  reactStrictMode: true,
};

module.exports = nextConfig;
