import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  // /api and /media are proxied at runtime via app/api/[...path] and app/media/[...path]
  // (reads API_BACKEND_URL on each request — works on Railway without rebuild).
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
