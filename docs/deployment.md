# VoteVault: Smart Contract Deployment & Network Operations Guide

This document outlines the deployment architecture, configuration parameters, and transparent deployment status for the VoteVault Compact smart contract on the **Midnight Network**.

---

## 1. Transparent Deployment Status Report

> [!IMPORTANT]
> **Deployment Status**: `SIMULATED` (Development / Local Enclave Mode)  
> **Published On-Chain**: `false`  
> **Network Context**: `midnight-devnet` (Simulated via local contract engine)  
> **Contract Address**: `0xsimulated_b0a42c997e95b7c6df4e1ab3d60901ccd46c50cb`  
> **Transaction Hash**: `0xsimulated_tx_d21c484545d9a2fff014456dfc31be46f6852ebfc13d2e07709348e91b457c5c`  

### Why Simulation Mode?
In development environments without an active, connected Midnight Devnet RPC node and local ZK Proof Server (`http://localhost:5001`), VoteVault executes in **Simulation Mode**. The application validates circuit constraints and state changes in local browser memory using `VoteVaultContract` (`contract/dist/index.js`). 

No fake transaction hashes or false mainnet explorer links are claimed.

---

## 2. On-Chain Deployment Instructions

When connecting to a live Midnight Devnet node, follow these steps to execute a true on-chain deployment.

### Step 1: Prerequisites
- **Node.js**: v20 or later
- **Midnight Node URL**: Running RPC endpoint (default `http://localhost:8080`)
- **ZK Proof Server**: Local proof server instance (default `http://localhost:5001`)
- **Admin Seed**: Funded deployment account seed phrase

### Step 2: Environment Setup
Set the required environment variables:
```bash
# Windows PowerShell
$env:VITE_MIDNIGHT_NODE_URL="http://localhost:8080"
$env:VITE_PROOF_SERVER_URL="http://localhost:5001"
$env:VITE_ADMIN_SEED="your_secret_admin_seed_phrase_here"
```

### Step 3: Compile Smart Contract
```bash
cd contract
npm run compile
```

### Step 4: Execute Deployment Script
```bash
npm run deploy
```

The script (`contract/deploy.js`) will:
1. Connect to `@midnight-network/midnight-js` SDK providers.
2. Initialize `VoteVaultContract`.
3. Construct the deployment transaction with initial parameters (`admin_pubkey`, `election_id`, `title`, `description`, `deadline`).
4. Generate ZK deployment proofs via the Proof Server.
5. Broadcast transaction to Midnight node and await block confirmation.
6. Write the resulting contract address to `contract/deployed-address.json`.

---

## 3. Deployment Artifacts

The deployment pipeline maintains record artifacts in `contract/deployed-address.json`:

```json
{
  "status": "SIMULATED",
  "environment": "Development / Local Enclave Mode",
  "publishedOnChain": false,
  "deployedAddress": "0xsimulated_b0a42c997e95b7c6df4e1ab3d60901ccd46c50cb",
  "txHash": "0xsimulated_tx_d21c484545d9a2fff014456dfc31be46f6852ebfc13d2e07709348e91b457c5c",
  "network": "devnet-simulated",
  "timestamp": "2026-07-28T20:39:43.000Z",
  "notes": "VoteVault contract state logic and zero-knowledge circuit inputs are validated client-side in simulator mode."
}
```
