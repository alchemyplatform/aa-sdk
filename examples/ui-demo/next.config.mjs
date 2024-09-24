await import("./env.mjs");

const nextConfig = {
    images: {
        remotePatterns: [
            {
              protocol: 'https',
              hostname: 'static.alchemyapi.io',
              port: '',
              pathname: '/assets/accountkit/**',
            },
          ],
    }
};

export default nextConfig;
