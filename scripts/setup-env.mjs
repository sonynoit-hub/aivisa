#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ex = path.join(root, '.env.example');
const devEx = path.join(root, '.env.development.example');
const prodEx = path.join(root, '.env.production.example');
const envLocal = path.join(root, '.env.local');
const devLocal = path.join(root, '.env.development.local');
const prodLocal = path.join(root, '.env.production.local');

function copyIfMissing(src, dst, mutator) {
  if (!fs.existsSync(src)) return false;
  if (fs.existsSync(dst)) return false;
  let content = fs.readFileSync(src, 'utf8');
  if (mutator) content = mutator(content);
  fs.writeFileSync(dst, content);
  console.log(`[env:init] created ${path.basename(dst)} from ${path.basename(src)}`);
  return true;
}

const ensureDev = () => {
  // Prefer specific development example if present; fallback to general
  const src = fs.existsSync(devEx) ? devEx : ex;
  copyIfMissing(src, devLocal, (c) => c
    .replace(/^APP_ENV=.*/m, 'APP_ENV=development')
    .replace(/^#?\s*NODE_ENV=.*/m, 'NODE_ENV=development')
    .replace(/^NEXT_PUBLIC_API_BASE=\s*$/m, 'NEXT_PUBLIC_API_BASE=http://localhost:3000')
    .replace(/^BACKEND_URL=\s*$/m, 'BACKEND_URL=http://localhost:8080')
  );
  // Also create .env.local for tools that read it in dev
  copyIfMissing(src, envLocal, (c) => c
    .replace(/^APP_ENV=.*/m, 'APP_ENV=development')
    .replace(/^#?\s*NODE_ENV=.*/m, 'NODE_ENV=development')
    .replace(/^NEXT_PUBLIC_API_BASE=\s*$/m, 'NEXT_PUBLIC_API_BASE=http://localhost:3000')
    .replace(/^BACKEND_URL=\s*$/m, 'BACKEND_URL=http://localhost:8080')
  );
};

const ensureProd = () => {
  const src = fs.existsSync(prodEx) ? prodEx : ex;
  copyIfMissing(src, prodLocal, (c) => c
    .replace(/^APP_ENV=.*/m, 'APP_ENV=deploy')
    .replace(/^#?\s*NODE_ENV=.*/m, 'NODE_ENV=production')
  );
};

ensureDev();
ensureProd();
