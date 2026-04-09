import fs from 'fs';
import path from 'path';
import type { DbSchema } from '@/types/schema';

const DEFAULT_DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const DEFAULT_TEMPLATE_PATH = path.join(process.cwd(), 'data', 'db.template.json');

function resolveDbPath(value: string | undefined, fallback: string): string {
  return value ? path.resolve(process.cwd(), value) : fallback;
}

function ensureParentDir(filePath: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readDbFile(filePath: string): DbSchema {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as DbSchema;
}

function writeDbFile(filePath: string, data: DbSchema): void {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

export function getDbPath(): string {
  return resolveDbPath(process.env.DB_PATH, DEFAULT_DB_PATH);
}

export function getDbTemplatePath(): string {
  return resolveDbPath(process.env.DB_TEMPLATE_PATH, DEFAULT_TEMPLATE_PATH);
}

export function readDbTemplate(): DbSchema {
  return readDbFile(getDbTemplatePath());
}

export function resetDbFromTemplate(): DbSchema {
  const template = readDbTemplate();
  writeDbFile(getDbPath(), template);
  return template;
}

export function readDb(): DbSchema {
  const dbPath = getDbPath();

  if (!fs.existsSync(dbPath)) {
    return resetDbFromTemplate();
  }

  return readDbFile(dbPath);
}

export function writeDb(data: DbSchema): void {
  writeDbFile(getDbPath(), data);
}
