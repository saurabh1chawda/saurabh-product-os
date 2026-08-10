import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle/portfolio-workspace",
  schema: "./src/portfolio-workspace/postgres/schema.ts",
  strict: true,
  verbose: true
});
