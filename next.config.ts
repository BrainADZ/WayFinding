import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(process.env.BRAINADZ_DEV_PORT
    ? { distDir: `.next-port-${process.env.BRAINADZ_DEV_PORT}` }
    : {}),
};

export default nextConfig;
