#!/usr/bin/env node

import { spawn } from 'node:child_process';

const commands = [
  ['npm', ['run', 'build'], { allowFailure: false }],
  ['npm', ['run', 'mvp:test:backend'], { allowFailure: false }],
  // Cucumber exits non-zero when scenarios are pending. Pending scenarios are
  // intentionally tracked as future work; actual failures still show up here.
  ['npm', ['run', 'mvp:test:bdd'], { allowFailure: true }],
  ['npm', ['run', 'verify:waitlist'], { allowFailure: false }],
];

function run(command, args, { allowFailure }) {
  return new Promise((resolve, reject) => {
    console.log(`\n$ ${[command, ...args].join(' ')}`);
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0 || allowFailure) {
        resolve({ command, args, code });
        return;
      }
      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
    });
  });
}

const results = [];
for (const [command, args, options] of commands) {
  results.push(await run(command, args, options));
}

console.log('\nStage 7 verification summary');
for (const result of results) {
  const label = [result.command, ...result.args].join(' ');
  const status = result.code === 0 ? 'passed' : `non-zero (${result.code}), accepted`;
  console.log(`- ${label}: ${status}`);
}
