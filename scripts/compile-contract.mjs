import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// Match compact-runtime 0.16.0. The manager itself has a different version number.
const compilerVersion = '0.31.1';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = 'contracts/stillwater.compact';
const target = 'contracts/managed/stillwater';
const toWslPath = (value) => value.replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`).replaceAll('\\', '/');
const shellQuote = (value) => `'${value.replaceAll("'", "'\\''")}'`;

if (!existsSync(resolve(root, source))) throw new Error(`Missing Compact source: ${source}`);
let result;
if (process.platform === 'win32') {
  // Windows compact.exe is a file-compression utility, NOT the Midnight compiler.
  // Resolve the user's Linux installation instead of hardcoding anyone's home path.
  const wslRoot = toWslPath(root);
  const command = `export PATH="$HOME/.local/bin:$HOME/.compact/bin:$PATH"; cd ${shellQuote(wslRoot)} || exit; exec "${process.env.COMPACT_BIN ?? 'compact'}" compile +${compilerVersion} ${shellQuote(source)} ${shellQuote(target)}`;
  result = spawnSync('wsl.exe', ['-d', process.env.COMPACT_WSL_DISTRO ?? 'Ubuntu', '--', 'bash', '-lc', command], {
    cwd: root, stdio: 'inherit', shell: false, env: { ...process.env, MSYS_NO_PATHCONV: '1' },
  });
} else {
  result = spawnSync(process.env.COMPACT_BIN ?? 'compact', ['compile', `+${compilerVersion}`, source, target], {
    cwd: root, stdio: 'inherit', shell: false,
  });
}
if (result.error || result.status !== 0) {
  throw new Error(`Compact compilation failed (${result.error?.message ?? result.status}). Install the Midnight Compact manager and compiler ${compilerVersion}${process.platform === 'win32' ? ' inside WSL Ubuntu' : ''}. No skip-zk artifacts are accepted.`);
}

const info = JSON.parse(readFileSync(resolve(root, target, 'compiler/contract-info.json'), 'utf8'));
if (info['compiler-version'] !== compilerVersion || info['runtime-version'] !== '0.16.0') {
  throw new Error('Generated compiler/runtime versions do not match the pinned toolchain.');
}
for (const circuit of info.circuits.filter((circuit) => circuit.proof)) {
  for (const file of [`keys/${circuit.name}.prover`, `keys/${circuit.name}.verifier`, `zkir/${circuit.name}.bzkir`, `zkir/${circuit.name}.zkir`]) {
    if (!existsSync(resolve(root, target, file)) || readFileSync(resolve(root, target, file)).length === 0) {
      throw new Error(`Missing real ZK artifact: ${file}`);
    }
  }
}
writeFileSync(resolve(root, target, 'build-info.json'), `${JSON.stringify({
  contract: 'VoteVault', compilerVersion, runtimeVersion: info['runtime-version'],
  source, sourceSha256: createHash('sha256').update(readFileSync(resolve(root, source))).digest('hex'),
  proofCircuits: info.circuits.filter((circuit) => circuit.proof).map((circuit) => circuit.name),
}, null, 2)}\n`);
console.log(`Compiled VoteVault with Compact ${compilerVersion}; full proving and verification artifacts present.`);
