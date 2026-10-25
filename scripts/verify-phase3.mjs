import { spawn } from 'node:child_process';
import { mkdir, open, readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, resolve, delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripVTControlCharacters } from 'node:util';
import { createHash } from 'node:crypto';
import { openSync, writeSync, closeSync, unlinkSync } from 'node:fs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'docs/verification/phase-3');
const entry = process.env.npm_execpath;
if (!entry?.includes('pnpm')) throw Error('Run pnpm verify:phase3');
await mkdir(resolve(root, '.cache'), { recursive: true });
const lockPath = resolve(root, '.cache/phase3-verification.lock');
const lock = openSync(lockPath, 'wx');
writeSync(lock, String(process.pid));
process.once('exit', () => { closeSync(lock); unlinkSync(lockPath); });
await mkdir(output, { recursive: true });
const pathKey = process.platform === 'win32' ? 'Path' : 'PATH';
const env = { ...process.env, NOBI_PNPM_ENTRY: entry, [pathKey]: resolve(dirname(entry), '../../.bin') + delimiter + (process.env[pathKey] || '') };
const checks = [];
let artifactsVerified = false;
const save = async () => writeFile(resolve(output, 'checks.json'), JSON.stringify({ checkedAt: new Date().toISOString(), scope: 'Phase 3 database-backed Web integration; isolated synthetic fixtures; no external data source', browserChannel: env.NOBI_BROWSER_CHANNEL || 'bundled chromium', mobileBrowser: 'webkit', checks, complete: artifactsVerified && checks.length === 8 && checks.every(item => item.exitCode === 0) }, null, 2) + '\n');
await save();
const steps = [
  ['backend', process.platform === 'win32' ? 'cmd.exe' : 'mvn', process.platform === 'win32' ? ['/d','/s','/c','mvn -B -Dmaven.repo.local=.cache/m2 -f services/racing-api/pom.xml -Pdatabase-it,browser-it verify'] : ['-B','-Dmaven.repo.local=.cache/m2','-f','services/racing-api/pom.xml','-Pdatabase-it,browser-it','verify']],
  ...['api:client:check','test:phase2:contracts','api:phase2:check','check:api','check:phase1','test:e2e:fixture','check:baseline'].map(script => [script, process.execPath, [entry,'run',script]]),
];
const normalize = text => stripVTControlCharacters(text).replaceAll('\r\n','\n').split('\n').map(line => line.trimEnd()).join('\n').trimEnd() + '\n';
for (const [name, binary, args] of steps) {
  const start = Date.now();const log = name.replaceAll(':','-') + '.log';console.log('Running ' + name);
  const handle = await open(resolve(output, log), 'w');let code;
  try {
    const child = spawn(binary, args, { cwd: root, env, windowsHide: true, stdio: ['ignore',handle.fd,handle.fd] });
    code = await new Promise((accept,reject) => { child.on('error',reject);child.on('close',accept); });
  } finally { await handle.close(); }
  const content = normalize(await readFile(resolve(output,log),'utf8'));await writeFile(resolve(output,log),content);
  checks.push({ command: name === 'backend' ? 'mvn -B -Dmaven.repo.local=.cache/m2 -f services/racing-api/pom.xml -Pdatabase-it,browser-it verify' : 'pnpm ' + name, exitCode: code, durationMs: Date.now() - start, log });
  await save();console.log(`${name}: exit ${code}`);
  if (code !== 0) { process.stdout.write(content);process.exitCode = 1;break; }
}
if (!process.exitCode) {
  const browserLog = normalize(await readFile(resolve(output,'backend-browser.log'),'utf8'));await writeFile(resolve(output,'backend-browser.log'),browserLog);
  const count = Number(browserLog.match(/(\d+) passed\s*\(/)?.[1]);
  if (count !== 18) throw Error('Expected all 18 backend browser checks');
  const files = [];
  for (const name of (await readdir(resolve(output,'screenshots'))).filter(name => name.endsWith('.png')).sort()) {
    const data = await readFile(resolve(output,'screenshots',name));
    files.push({ path: 'screenshots/' + name, bytes: data.length, width: data.readUInt32BE(16), height: data.readUInt32BE(20), sha256: createHash('sha256').update(data).digest('hex') });
  }
  if (files.length !== 24) throw Error('Expected all 24 backend screenshots');
  await writeFile(resolve(output,'browser-results.json'),JSON.stringify({ checkedAt: new Date().toISOString(), backendBrowserChecks: count, fixtureBrowserChecks: 26, screenshotCount: files.length, screenshots: files },null,2) + '\n');
  artifactsVerified = true;
  await save();
}
