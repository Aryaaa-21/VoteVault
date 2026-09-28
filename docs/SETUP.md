# VoteVault setup

## Toolchain

VoteVault is pinned to Node 22, Compact 0.31.1, Compact runtime 0.16.0, and Midnight.js 4.1.1. On Windows, install the Compact manager inside WSL Ubuntu. Do not run the Windows `compact.exe` compression utility.

```bash
node --version
npm --version
compact --version
npm install
npm run compile
```

The compile script calls `compact compile +0.31.1`, checks the generated compiler/runtime metadata, and requires non-empty `.prover`, `.verifier`, `.bzkir`, and `.zkir` assets for each proof circuit.

## Local environment

Docker services are optional and defined in `compose.yml`:

```bash
npm run env:up
npm run compile
npm run test:local
npm run env:down
```

The local integration services are not a substitute for Preview or Preprod evidence.

## Frontend

```bash
npm run dev
```

The frontend reads network-specific indexers from `VITE_PREVIEW_*` and `VITE_PREPROD_*` variables. Contract addresses are intentionally empty by default. Studio stores only the selected network's verified address in browser storage after a deployment transaction is submitted.

## Secrets

Never commit:

- wallet mnemonics or seeds;
- operator secrets;
- visitor secrets or exported pass backups;
- private environment files.

VoteVault keeps operator and visitor secrets in memory in the browser. A backup is available only after an explicit acknowledgement and is copied to the clipboard; this is a convenience, not a vault.
