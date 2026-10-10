import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/careerbridge",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
