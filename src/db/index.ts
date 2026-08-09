import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgrespassword@localhost:5433/traqon_db';

const pool = new Pool({ connectionString });

export const db = drizzle(connectionString, {
  schema,
} as unknown as NonNullable<Parameters<typeof drizzle>[1]>);

export type Database = typeof db;
export type DbTransaction = Parameters<
  Parameters<Database['transaction']>[0]
>[0];
