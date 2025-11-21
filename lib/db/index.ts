import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Initialize SQLite database
const sqlite = new Database('soseki.db');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

export * from './schema';
