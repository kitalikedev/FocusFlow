#!/usr/bin/env node
/**
 * Stops secrets from reaching the repository.
 *
 *   node scripts/check-secrets.mjs           checks every tracked file (CI)
 *   node scripts/check-secrets.mjs --staged  checks only what is about to be committed (pre-commit hook)
 *
 * It fails when a .env file other than .env.example is included, or when a file contains key material:
 * Supabase keys, JSON Web Tokens, private keys, GitHub tokens or AWS keys. Placeholders such as
 * `sb_publishable_xxxx` in the docs are allowed.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const staged = process.argv.includes('--staged');

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

const files = (staged ? git(['diff', '--cached', '--name-only', '--diff-filter=ACMR']) : git(['ls-files']))
  .split('\n')
  .filter(Boolean);

const ENV_FILE = /(^|\/)(\.env(\..+)?|[^/]+\.env)$/;
const ALLOWED_ENV_FILE = /(^|\/)\.env\.example$/;
const SKIP_CONTENT = /(^|\/)package-lock\.json$|\.(png|jpe?g|gif|webp|ico|svg|woff2?|ttf|otf|zip|pdf)$/i;

const RULES = [
  { name: 'Supabase secret key', pattern: /sb_secret_[A-Za-z0-9_-]{10,}/ },
  { name: 'Supabase publishable key (keep it in .env.local)', pattern: /sb_publishable_(?!x+\b)[A-Za-z0-9_-]{16,}/ },
  { name: 'JSON Web Token', pattern: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: 'Private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'GitHub token', pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}/ },
  { name: 'AWS access key', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
];

function readContent(file) {
  try {
    return staged ? git(['show', `:${file}`]) : readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

const problems = [];

for (const file of files) {
  if (ENV_FILE.test(file) && !ALLOWED_ENV_FILE.test(file)) {
    problems.push(`${file}: environment file must never be committed (only .env.example is allowed)`);
    continue;
  }
  if (SKIP_CONTENT.test(file)) continue;
  readContent(file)
    .split('\n')
    .forEach((line, index) => {
      for (const rule of RULES) {
        if (rule.pattern.test(line)) problems.push(`${file}:${index + 1}: ${rule.name}`);
      }
    });
}

if (problems.length > 0) {
  console.error('Secret check failed:');
  problems.forEach((problem) => console.error(`  - ${problem}`));
  console.error('\nRemove these from the commit (git restore --staged <file>) and keep secrets in .env.local.');
  process.exit(1);
}

console.log(`Secret check passed (${files.length} ${staged ? 'staged' : 'tracked'} files).`);
