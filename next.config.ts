import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tambahkan baris ini untuk mengizinkan akses dari IP Anda
  allowedDevOrigins: ['192.168.56.1'],
};

export default nextConfig;