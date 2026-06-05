import withPWAInit from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  typescript: {
    // !! PERINGATAN !!
    // Mengizinkan build production selesai dengan sukses meskipun
    // project kamu memiliki error TypeScript.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Mengabaikan linting saat build production
    ignoreDuringBuilds: true,
  },
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default withPWA(nextConfig);
