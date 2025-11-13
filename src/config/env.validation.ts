import z from 'zod';
import { config } from 'dotenv';

config({ quiet: true });

const validatedEnv = z
  .object({
    PORT: z.coerce.number().int().min(0).max(65535).default(3000),
    NODE_ENV: z.enum(['development', 'production']).default('development'),

    DATABASE_URL: z.string(),

    ACCESS_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRES_IN: z.string(),
    REFRESH_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_EXPIRES_IN: z.string(),
  })
  .parse(process.env);

export type Env = typeof validatedEnv;
export const env = () => validatedEnv;
