import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    '*': ['.claude/**'],
  },
};

export default nextConfig;
