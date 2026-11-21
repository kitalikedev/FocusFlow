import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(__dirname, '../index.css'), 'utf8');

/** The rule block that styles pressed buttons ("button:not(:disabled):active"), with and without reduced motion. */
function pressedRules(): string[] {
  const blocks: string[] = [];
  const pattern = /button:not\(:disabled\):active[^{]*\{([^}]*)\}/g;
  for (let match = pattern.exec(css); match; match = pattern.exec(css)) blocks.push(match[1]);
  return blocks;
}

describe('press effect of buttons', () => {
  it('uses the separate `scale` property so it never replaces a centering `transform`', () => {
    const rules = pressedRules();
    expect(rules.length).toBeGreaterThanOrEqual(2);
    for (const rule of rules) expect(rule).not.toMatch(/transform\s*:/);
    expect(rules.some((rule) => /scale\s*:\s*0\.95/.test(rule))).toBe(true);
  });

  it('turns the press effect off for reduced motion', () => {
    expect(pressedRules().some((rule) => /scale\s*:\s*none/.test(rule))).toBe(true);
  });
});
