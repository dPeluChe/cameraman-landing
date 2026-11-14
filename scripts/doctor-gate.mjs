#!/usr/bin/env node
// Fails unless react-doctor scores 100. A lower score is a finding to fix, not a number
// to accept; never silence a rule in config. Unfixable findings are recorded under "Known
// and accepted" in docs/TASK_TODO.md (docs/GUIDES/TESTING.md#the-static-analysis-gate).
import { execFileSync } from 'node:child_process';

const output = execFileSync('npx', ['react-doctor', '--score'], { encoding: 'utf8' });
const score = Number(output.trim().split('\n').at(-1));
if (!Number.isInteger(score)) {
  console.error(`Could not read a score from react-doctor:\n${output}`);
  process.exit(1);
}
if (score < 100) {
  console.error(`react-doctor score is ${score}, expected 100. Run: npx react-doctor . --verbose`);
  process.exit(1);
}
console.log('react-doctor: 100');
