import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
  dbCredentials: {
    url: './local.db',
  },
} satisfies Config;
