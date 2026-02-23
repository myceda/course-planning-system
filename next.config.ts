import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // บรรทัดนี้ คือ ส่วนที่จะแก้ปัญหา
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
