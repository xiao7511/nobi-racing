import { spawnSync } from 'node:child_process';
const windows = process.platform === 'win32';
const commands = [['node',['--version']],['pnpm',['--version']],['java',['-version']],['javac',['-version']],['mvn',['--version']],['git',['--version']],['docker',['--version']],['docker',['info','--format','{{.ServerVersion}}']]];
let failed = 0;
for (let [command,args] of commands) {
  const shell = windows && ['pnpm','mvn'].includes(command);
  // Only the fixed command/argument allowlist above is passed through cmd.exe.
  const executable = shell ? (process.env.ComSpec || 'cmd.exe') : command;
  const invocation = shell ? ['/d', '/s', '/c', command + '.cmd ' + args.join(' ')] : args;
  const result = spawnSync(executable, invocation, { encoding: 'utf8', windowsHide: true, timeout: 15000 });
  const ok = result.status === 0;
  if (!ok) failed++;
  console.log(JSON.stringify({ command: [command,...args].join(' '), available: ok, output: ((result.stdout || '') + (result.stderr || '') + (result.error?.message || '')).trim() }));
}
console.log('iOS builds require macOS + Xcode 26; Android builds require Android Studio 2025.2.1+ and SDK 36. Native SDK checks are deferred to native runners.');
if (process.argv.includes('--strict') && failed) process.exitCode = 1;
