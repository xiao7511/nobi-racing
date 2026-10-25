import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const manifest = await load('package.json');
assert.equal(manifest.private, true);
assert.match(manifest.packageManager, /^pnpm@10\./);
for (const directory of ['apps', 'packages', 'services', 'infra', 'docs']) await readdir(resolve(root, directory));
const keys = (object, prefix = '') => Object.entries(object).flatMap(([key, value]) => typeof value === 'object' ? keys(value, prefix + key + '.') : [prefix + key]).sort();
const en = await load('packages/i18n/src/en.json');
const zh = await load('packages/i18n/src/zh-CN.json');
assert.deepEqual(keys(en), keys(zh), 'Locale keys must match');
assert.equal(Object.keys(en.nav).length, 5);
const api = await load('packages/contracts/openapi.json');
assert.equal(api.openapi, '3.1.0');
const ids = new Set();
const visit = value => {
  if (!value || typeof value !== 'object') return;
  if (value.$ref) {
    assert.ok(value.$ref.startsWith('#/'), 'Only local OpenAPI refs allowed');
    let target = api;
    for (const part of value.$ref.slice(2).split('/')) target = target?.[part];
    assert.ok(target, 'Unresolved reference: ' + value.$ref);
  }
  for (const child of Object.values(value)) visit(child);
};
visit(api);
for (const [path, item] of Object.entries(api.paths)) for (const [method, operation] of Object.entries(item)) {
  if (!['get','post','put','patch','delete'].includes(method)) continue;
  assert.ok(operation.operationId);
  assert.ok(!ids.has(operation.operationId), 'Duplicate operation id'); ids.add(operation.operationId);
  if (path.includes('/admin/')) {
    assert.notDeepEqual(operation.security, [], 'Admin must require authentication');
    assert.ok(operation['x-permissions']?.length, 'Admin permission mapping required');
  }
}
const files = [];
async function walk(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (['.git','node_modules','dist','target','.cache','.tools','test-results','playwright-report'].includes(item.name)) continue;
    const path = resolve(directory, item.name);
    if (item.isDirectory()) await walk(path); else files.push(path);
  }
}
await walk(root);
for (const file of files) {
  const name = relative(root, file).replaceAll('\\', '/');
  assert.ok(!/(^|\/)\.env(?!\.example$)/.test(name), 'Private env file in baseline: ' + name);
  const content = await readFile(file, 'utf8');
  assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content), 'Private key material detected');
  assert.ok(!/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16}|sk-[A-Za-z0-9]{32,})\b/.test(content), 'Credential pattern detected');
  assert.ok(!/\b(?:password|token|secret)\s*[:=]\s*["'](?!["']|\$\{)[^"'\n]{8,}["']/i.test(content), 'Hardcoded credential detected in ' + name);
}
for (const file of ['docs/architecture.md','docs/database.md','docs/ui-design.md','docs/data-sources-and-authorization.md','docs/build-security-cicd.md','docs/phases/phase-1-6-plan.md','docs/security-risk-register.md','docs/phases/phase-0-report.md']) assert.ok((await readFile(resolve(root, file), 'utf8')).length > 100);
console.log('PASS baseline: workspace, locale parity, 5 navigation entries, OpenAPI references/permissions, credential patterns, documentation (' + files.length + ' files).');
console.log('Scope: static checks only; not a dependency audit, full OpenAPI validator, SQL execution or app build.');
