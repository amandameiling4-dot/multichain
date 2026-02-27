import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling these server-side packages.
  // `pg` and the Prisma adapter use native Node.js APIs that break when
  // bundled by the Next.js App Router bundler.
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "@prisma/client"],
};

export default nextConfig;
