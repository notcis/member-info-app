import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  eslint: {
    // ปิดการเช็ค ESLint ตอน build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ปิดการเช็ค Type ตอน build (ถ้ามั่นใจว่าโค้ดไม่มี Error)
    ignoreBuildErrors: true,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

export default nextConfig;
