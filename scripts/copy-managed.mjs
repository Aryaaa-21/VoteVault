import { cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const generated = resolve(root, 'contracts/managed/stillwater');
const contract = resolve(generated, 'contract');
const frontendContract = resolve(root, 'frontend/src/managed/contract');
const frontendPublic = resolve(root, 'frontend/public/managed');
if (!existsSync(contract) || !existsSync(resolve(generated, 'compiler/contract-info.json'))) {
  throw new Error('VoteVault artifacts are missing. Run npm run compile first.');
}
rmSync(frontendContract, { recursive: true, force: true });
rmSync(frontendPublic, { recursive: true, force: true });
cpSync(contract, frontendContract, { recursive: true });
cpSync(generated, frontendPublic, { recursive: true });
console.log('Copied generated VoteVault bindings and full ZK artifacts.');
