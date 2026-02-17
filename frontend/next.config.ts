import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 
  reactCompiler: true,
  

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.google.com',
      },
      {
        protocol: 'http',
        hostname: 'books.google.com',
      },
    ],
  },

  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,   
      aggregateTimeout: 300, 
    };
    return config;
  },
};

export default nextConfig;