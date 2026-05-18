import type { NextConfig } from "next";
import path from "path";

const API_BACKEND = process.env.API_BACKEND_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BACKEND}/api/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${API_BACKEND}/media/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      { protocol: "http", hostname: "backend", port: "8000" },
      { protocol: "https", hostname: "**.digitaloceanspaces.com" },
      { protocol: "https", hostname: "cekfisi.fra1.digitaloceanspaces.com" },
      { protocol: "https", hostname: "**.up.railway.app" },
    ],
  },
};

export default nextConfig;
