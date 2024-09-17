/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: 'essentialsplus1.s3.eu-north-1.amazonaws.com',
        protocol: 'https',
      },
      {
        hostname: 'media.istockphoto.com',
        protocol: 'https',
      },
      {
        hostname: 'localhost',
        protocol: 'http',
      },
      {
        hostname: 'assets.bonappetit.com',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;
