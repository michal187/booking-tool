import fs from 'fs';
import path from 'path';

const root = process.cwd();
const args = process.argv.slice(2);

function readArg(name, fallback) {
  const index = args.indexOf(name);

  if (index === -1 || index === args.length - 1) {
    return fallback;
  }

  return args[index + 1];
}

const dbArg = readArg('--db', process.env.DB_PATH ?? 'data/db.json');
const templateArg = readArg('--template', process.env.DB_TEMPLATE_PATH ?? 'data/db.template.json');

const dbPath = path.resolve(root, dbArg);
const templatePath = path.resolve(root, templateArg);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
fs.copyFileSync(templatePath, dbPath);

process.stdout.write(`Reset DB: ${dbPath}\nFrom template: ${templatePath}\n`);
