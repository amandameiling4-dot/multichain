import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations must use the direct (unpooled) connection on Neon to bypass
    // PgBouncer, which does not support DDL transaction statements.
    // DATABASE_URL_UNPOOLED is the direct URL; DATABASE_URL is the pooled
    // fallback (used only when the unpooled variable is not set).
    url: process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"],
  },
});
