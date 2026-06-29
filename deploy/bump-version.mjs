#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packageJsonPath = resolve(process.argv[2] ?? '../src/package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

const parts = packageJson.version.split('.').map(Number);
if (parts.length !== 3 || parts.some(Number.isNaN)) {
  console.error(`Gecersiz semver: ${packageJson.version}`);
  process.exit(1);
}

parts[2] += 1;
packageJson.version = parts.join('.');

writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
console.log(packageJson.version);
