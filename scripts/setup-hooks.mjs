#!/usr/bin/env node
/**
 * Runs on `npm install` / `npm ci` (the "prepare" script): points git to the versioned hooks in .githooks so the
 * secret check runs before every commit. Does nothing outside a git checkout (for example on Vercel).
 */
import { execFileSync } from 'node:child_process';

try {
  execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' });
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' });
} catch {
  // Not a git checkout: nothing to set up.
}
