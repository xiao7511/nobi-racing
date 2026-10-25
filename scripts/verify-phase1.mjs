import { spawn } from 'node:child_process';
import { mkdir, open, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripVTControlCharacters } from 'node:util';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'docs/verification/phase-1');
const entry = process.env.npm_execpath;
if (!entry || !entry.includes('pnpm')) throw new Error('Run with pnpm verify:phase1.');
await mkdir(output, { recursive: true });
const results = [];
const pathKey = process.platform === 'win32' ? 'Path' : 'PATH';
const env = { ...process.env, [pathKey]: resolve(dirname(entry), '../../.bin') + delimiter + (process.env[pathKey] || '') };
for (const command of ['check:baseline', 'lint', 'typecheck', 'test', 'build', 'check:api', 'test:e2e']) {
  const start = Date.now();
  console.log(`Running ${command}`);
  const logFile = command.replaceAll(':', '-') + '.log';
  const handle = await open(resolve(output, logFile), 'w');
  let code;
  try {
    // Use a file handle instead of nested Windows stdout pipes. Preserve the actual exit code.
    const child = spawn(process.execPath, [entry, 'run', command], { cwd: root, env, windowsHide: true, stdio: ['ignore', handle.fd, handle.fd] });
    code = await new Promise((accept, reject) => { child.on('error', reject); child.on('close', accept); });
  } finally { await handle.close(); }
  const log = stripVTControlCharacters(await readFile(resolve(output, logFile), 'utf8')).trimEnd() + '\n';
  await writeFile(resolve(output, logFile), log);
  console.log(`${command}: exit ${code} (${Date.now() - start} ms)`);
  results.push({ command: `pnpm ${command}`, exitCode: code, passed: code === 0, durationMs: Date.now() - start, log: logFile });
  await writeFile(resolve(output, 'checks.json'), JSON.stringify({ checkedAt: new Date().toISOString(), scope: 'Phase 1 fan application; synthetic data only', browserChannel: process.env.NOBI_BROWSER_CHANNEL || 'bundled chromium', mobileBrowser: 'webkit', checks: results, complete: results.length === 7 && results.every(item => item.passed) }, null, 2) + '\n');
  if (code !== 0) { process.stdout.write(log); process.exitCode = 1; break; }
}
