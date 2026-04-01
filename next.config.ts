import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // IMPORTANT: no http:// and no :3000
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.56.1",
  ],
};

export default nextConfig;
