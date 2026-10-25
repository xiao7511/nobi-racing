import { spawn } from 'node:child_process';
import { mkdir, open, readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, delimiter } from 'node:path';
import { stripVTControlCharacters } from 'node:util';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'docs/verification/phase-2');
const entry = process.env.npm_execpath;
if (!entry?.includes('pnpm')) throw Error('Run pnpm verify:phase2');
await mkdir(output, { recursive: true });
const pathKey = process.platform === 'win32' ? 'Path' : 'PATH';
const env = { ...process.env, [pathKey]: resolve(dirname(entry), '../../.bin') + delimiter + (process.env[pathKey] || '') };
const checks = [];
const save = async () => writeFile(resolve(output, 'checks.json'), JSON.stringify({ checkedAt: new Date().toISOString(), scope: 'Phase 2 synthetic backend; real isolated PostgreSQL/Redis tests; no third-party data', checks, complete: checks.length === 6 && checks.every(item => item.exitCode === 0) }, null, 2) + '\n');
await save();
const steps = [
  ['backend', process.platform === 'win32' ? 'cmd.exe' : 'mvn', process.platform === 'win32'
    ? ['/d', '/s', '/c', 'mvn -B -Dmaven.repo.local=.cache/m2 -f services/racing-api/pom.xml -Pdatabase-it verify']
    : ['-B', '-Dmaven.repo.local=.cache/m2', '-f', 'services/racing-api/pom.xml', '-Pdatabase-it', 'verify']],
  ...['test:phase2:contracts', 'api:phase2:check', 'check:api', 'check:phase1', 'check:baseline'].map(script => [script, process.execPath, [entry, 'run', script]]),
];
for (const [name, binary, args] of steps) {
  const start = Date.now(); const log = name.replaceAll(':', '-') + '.log';
  console.log('Running ' + name);
  const handle = await open(resolve(output, log), 'w');
  let code;
  try {
    // The Windows cmd command is a fixed literal: no user input, interpolation or credentials.
    const child = spawn(binary, args, { cwd: root, env, windowsHide: true, stdio: ['ignore', handle.fd, handle.fd] });
    code = await new Promise((accept, reject) => { child.on('error', reject); child.on('close', accept); });
  } finally { await handle.close(); }
  const content = stripVTControlCharacters(await readFile(resolve(output, log), 'utf8')).replaceAll('\r\n', '\n').split('\n').map(line => line.trimEnd()).join('\n').trimEnd() + '\n';
  await writeFile(resolve(output, log), content);
  checks.push({ command: name === 'backend' ? 'mvn -B -Dmaven.repo.local=.cache/m2 -f services/racing-api/pom.xml -Pdatabase-it verify' : 'pnpm ' + name, exitCode: code, durationMs: Date.now() - start, log });
  await save(); console.log(`${name}: exit ${code}`);
  if (code !== 0) { process.stdout.write(content); process.exitCode = 1; break; }
}
if (!process.exitCode) {
  const suites = [];
  for (const folder of ['surefire-reports', 'failsafe-reports']) {
    const directory = resolve(root, 'services/racing-api/target', folder);
    for (const file of (await readdir(directory)).filter(file => file.startsWith('TEST-') && file.endsWith('.xml'))) {
      const xml = await readFile(resolve(directory, file), 'utf8');
      const header = xml.match(/<testsuite\s[^>]+>/)?.[0];
      const property = key => header?.match(new RegExp(key + '="([^"]+)"'))?.[1];
      const suite = { name: property('name'), tests: Number(property('tests')), failures: Number(property('failures')), errors: Number(property('errors')), skipped: Number(property('skipped')) };
      if (suite.failures || suite.errors || suite.skipped) throw Error('Backend tests must not be skipped or fail');
      suites.push(suite);
    }
  }
  await writeFile(resolve(output, 'backend-tests.json'), JSON.stringify({ checkedAt: new Date().toISOString(), suites }, null, 2) + '\n');
}
