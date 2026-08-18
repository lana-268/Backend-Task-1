import "dotenv/config";

import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3011),
});

export const config = environmentSchema.parse(process.env);
