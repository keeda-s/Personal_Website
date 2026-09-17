import type { NextConfig } from "next";

const isExport = Boolean(process.env.NEXT_EXPORT);

const nextConfig: NextConfig = {
  ...(isExport
    ? {
        output: "export" as const,
        trailingSlash: true,
        images: { unoptimized: true },
        pageExtensions: ["tsx", "jsx"] as string[],
      }
    : {}),
};

export default nextConfig;
