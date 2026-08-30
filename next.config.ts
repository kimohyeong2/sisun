import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow development from the local network IP
  allowedDevOrigins: ['192.168.55.216'],
};

export default nextConfig;
