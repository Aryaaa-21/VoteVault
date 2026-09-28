const fs = require('node:fs');
const path = require('node:path');

const contractPath = path.join(__dirname, '..', 'contracts', 'managed', 'stillwater', 'contract', 'index.js');
if (fs.existsSync(contractPath)) {
  const current = fs.readFileSync(contractPath, 'utf8');
  fs.writeFileSync(contractPath, current.replace(/from \"\.\/\.\/\.\/\.\.\/\.\.\/\.\.\/node_modules\/([^\"]+)\"/g, 'from "$1"'));
  console.log('Generated VoteVault bindings are ready.');
}
