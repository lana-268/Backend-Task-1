import { defineConfig } from "prisma/config";

import { config } from "./src/config.ts";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --env-file=.env prisma/seed.ts",
  },
  datasource: { url: config.DATABASE_URL },
});
