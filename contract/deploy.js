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
 * Required Environment Variables:
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
        console.warn("\n[Warning] VITE_ADMIN_SEED environment variable is not defined.");
        console.warn("Deploying in DRY RUN / SIMULATOR mode. To deploy on-chain, please set VITE_ADMIN_SEED.");
        
        // Simulating deployment in development/CI context
        console.log("\nDeploying contract in simulator mode...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const simulatedAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
        const txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
        
        console.log("\n[Success] Contract deployed successfully!");
        console.log(`- Contract Address: ${simulatedAddress}`);
        console.log(`- Transaction Hash: ${txHash}`);
        
        // Save deployed details to disk
        const deployDetails = {
            deployedAddress: simulatedAddress,
            txHash: txHash,
            network: 'devnet-simulated',
            timestamp: new Date().toISOString()
        };
        fs.writeFileSync(path.join(__dirname, 'deployed-address.json'), JSON.stringify(deployDetails, null, 2));
        console.log(`- Saved details to contract/deployed-address.json`);
        return;
    }

    try {
        console.log("\nLoading Midnight.js SDK modules...");
        // Dynamic imports to prevent load issues on systems lacking complete toolchain dependencies
        const { createMidnightProvider } = await import('@midnight-network/midnight-js');
        const { VoteVaultContract } = await import('./dist/index.js');

        console.log("Initializing Midnight network providers...");
        const provider = await createMidnightProvider({
            nodeUrl: nodeUrl,
            proofServerUrl: proofServerUrl,
            seed: adminSeed
        });

        console.log("Creating transaction and generating ZK deployment proof...");
        // Instantiate contract definition
        const contractInstance = new VoteVaultContract();
        
        // Define initial parameters
        const adminPubKeyBytes = Buffer.from(provider.getAdminPublicKey(), 'hex');
        const electionIdBytes = Buffer.from('VV-2024-NB-01'.padEnd(32, ' ')).slice(0, 32);
        const title = 'National Budget 2024';
        const description = 'Decide allocation of national reserve funds.';

        console.log("Broadcasting deployment transaction to Midnight network...");
        const deploymentTx = await provider.deploy({
            contract: contractInstance,
            args: [adminPubKeyBytes, electionIdBytes, title, description]
        });

        await deploymentTx.wait();
        const address = deploymentTx.getContractAddress();
        
        console.log("\n[Success] Contract deployed successfully on-chain!");
        console.log(`- Contract Address: ${address}`);
        console.log(`- Transaction Hash: ${deploymentTx.hash}`);

        // Save deployed details to disk
        const deployDetails = {
            deployedAddress: address,
            txHash: deploymentTx.hash,
            network: 'devnet-onchain',
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
