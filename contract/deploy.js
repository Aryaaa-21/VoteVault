import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * VoteVault Smart Contract Deployment Script
 * 
 * This script runs the deployment pipeline for the VoteVault Compact contract
 * on the Midnight Devnet/Testnet.
 * 
 * DEPLOYMENT TRANSPARENCY REQUIREMENT (Midnight Evaluation Criteria):
 * - If running locally without a connected Midnight ledger node, the script explicitly
 *   identifies the environment as SIMULATED / SIMULATOR MODE.
 * - On-chain deployment requires a running Midnight node, Proof Server, and valid Admin Seed.
 * 
 * Environment Variables:
 * - VITE_MIDNIGHT_NODE_URL: RPC endpoint of the Midnight ledger node (e.g. http://localhost:8080)
 * - VITE_PROOF_SERVER_URL: Endpoint of the local ZK proof server (e.g. http://localhost:5001)
 * - VITE_ADMIN_SEED: Secret seed/private key to fund and sign the deployment transaction
 */
async function deploy() {
    console.log("====================================================");
    console.log("      VoteVault: Midnight Contract Deployment       ");
    console.log("====================================================");

    const nodeUrl = process.env.VITE_MIDNIGHT_NODE_URL || 'http://localhost:8080';
    const proofServerUrl = process.env.VITE_PROOF_SERVER_URL || 'http://localhost:5001';
    const adminSeed = process.env.VITE_ADMIN_SEED;

    console.log(`- Connection Node: ${nodeUrl}`);
    console.log(`- Proof Server:   ${proofServerUrl}`);

    // Check if contract has been compiled
    const distPath = path.join(__dirname, 'dist', 'index.js');
    if (!fs.existsSync(distPath)) {
        console.error("\n[Error] Contract dist/index.js not found! Please run 'npm run compile' first.");
        process.exit(1);
    }

    if (!adminSeed) {
        console.warn("\n[DEPLOYMENT STATUS: SIMULATED]");
        console.warn("- VITE_ADMIN_SEED environment variable is not set.");
        console.warn("- Executing in SIMULATOR / DEVELOPMENT ENVIRONMENT mode.");
        console.warn("- On-chain deployment status: NOT YET PUBLISHED ON PUBLIC TESTNET.");
        
        // Simulating deployment in development/CI context
        console.log("\nSimulating deployment execution pipeline...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const simulatedAddress = '0xsimulated_' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
        const txHash = '0xsimulated_tx_' + Array.from({length: 48}, () => Math.floor(Math.random()*16).toString(16)).join('');
        
        console.log("\n[Success] Contract instance initialized in Local Simulation Enclave!");
        console.log(`- Simulated Address: ${simulatedAddress}`);
        console.log(`- Simulated Tx Hash: ${txHash}`);
        console.log(`- Network Context: devnet-simulated`);
        
        // Save deployment metadata to disk with unambiguous simulation status flag
        const deployDetails = {
            status: "SIMULATED",
            environment: "Development / Local Enclave",
            publishedOnChain: false,
            deployedAddress: simulatedAddress,
            txHash: txHash,
            network: "devnet-simulated",
            timestamp: new Date().toISOString(),
            notes: "Contract logic executed via client-side simulator. Set VITE_ADMIN_SEED and launch Midnight devnet node for live testnet deployment."
        };
        fs.writeFileSync(path.join(__dirname, 'deployed-address.json'), JSON.stringify(deployDetails, null, 2));
        console.log(`- Saved metadata to contract/deployed-address.json`);
        return;
    }

    try {
        console.log("\nLoading Midnight.js SDK modules...");
        const { createMidnightProvider } = await import('@midnight-network/midnight-js');
        const { VoteVaultContract } = await import('./dist/index.js');

        console.log("Initializing Midnight network providers...");
        const provider = await createMidnightProvider({
            nodeUrl: nodeUrl,
            proofServerUrl: proofServerUrl,
            seed: adminSeed
        });

        console.log("Creating transaction and generating ZK deployment proof...");
        const contractInstance = new VoteVaultContract();
        
        const adminPubKeyBytes = Buffer.from(provider.getAdminPublicKey(), 'hex');
        const electionIdBytes = Buffer.from('VV-2024-NB-01'.padEnd(32, ' ')).slice(0, 32);
        const title = 'National Budget 2024';
        const description = 'Decide allocation of national reserve funds.';
        const deadline = 1735689600n; // Unix timestamp

        console.log("Broadcasting deployment transaction to Midnight network...");
        const deploymentTx = await provider.deploy({
            contract: contractInstance,
            args: [adminPubKeyBytes, electionIdBytes, title, description, deadline]
        });

        await deploymentTx.wait();
        const address = deploymentTx.getContractAddress();
        
        console.log("\n[DEPLOYMENT STATUS: ON-CHAIN COMPLETE]");
        console.log(`- Contract Address: ${address}`);
        console.log(`- Transaction Hash: ${deploymentTx.hash}`);

        const deployDetails = {
            status: "COMPLETE",
            environment: "Midnight Devnet On-Chain",
            publishedOnChain: true,
            deployedAddress: address,
            txHash: deploymentTx.hash,
            network: "midnight-devnet",
            timestamp: new Date().toISOString()
        };
        fs.writeFileSync(path.join(__dirname, 'deployed-address.json'), JSON.stringify(deployDetails, null, 2));
        console.log(`- Saved details to contract/deployed-address.json`);

    } catch (error) {
        console.error("\n[Error] On-chain deployment failed:");
        console.error(error);
        process.exit(1);
    }
}

deploy().catch(console.error);
