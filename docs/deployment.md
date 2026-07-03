# VoteVault: Deployment Guide

This document outlines the steps required to deploy the VoteVault frontend to **Vercel** and compile the Compact smart contract for the **Midnight Network**.

## 1. Frontend Deployment (Vercel)

The frontend is a React SPA built with Vite. It can be easily deployed to Vercel.

### Vercel Dashboard Settings
When setting up a new project on Vercel, configure the following:
- **Framework Preset**: Vite / React
- **Root Directory**: `votevault/frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Dynamic Routing
Vite SPAs use client-side routing. To prevent Vercel from returning `404` on page refreshes, we include a `vercel.json` file in the frontend root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "framework": "vite"
}
```

---

## 2. Smart Contract Compilation (Midnight Network)

Before the frontend can interact with the smart contract, the Compact circuit must be compiled using the Midnight toolchain.

### Prerequisites
Ensure the Midnight Compact compiler is installed on your system:
```bash
# Verify compact compiler is active
compact --version
```

### Compile Contract
Navigate to the contract directory and run the compiler script:
```bash
cd votevault/contract
npm install
npm run compile
```

This compiles the contract logic in `src/index.compact` and outputs the zero-knowledge circuit schemas, TS/JS bindings, and ABI files into the `dist` directory.

---

## 3. Production Environment Variables

To link the compiled contract and wallet connection SDK in production, define the following variables in your Vercel Dashboard:

| Variable Name | Description | Example / Fallback |
| :--- | :--- | :--- |
| `VITE_MIDNIGHT_NETWORK_ID` | The Midnight ledger identifier (testnet/devnet). | `midnight-devnet-3` |
| `VITE_CONTRACT_ADDRESS` | Address of the deployed VoteVault compact contract. | `0x5b38...3f1d` |
| `VITE_LACE_WALLET_PROVIDER` | Injected provider name for wallet operations. | `lace` |
