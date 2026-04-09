import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages use Node.js APIs and should not be bundled by Next.js
  serverExternalPackages: ["@openai/agents", "@openai/agents-core", "@openai/agents-openai"],
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
    CRM_URL: process.env.CRM_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
