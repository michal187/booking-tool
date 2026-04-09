import fs from 'fs';
import path from 'path';
import type { DbSchema } from '@/types/schema';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export function readDb(): DbSchema {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as DbSchema;
}

export function writeDb(data: DbSchema): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
