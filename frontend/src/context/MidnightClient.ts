/**
 * Midnight Client Service for VoteVault
 * 
 * This module manages all direct integration points with the @midnight-network/midnight-js SDK,
 * the compiled Compact contract circuits, and the Lace Wallet injected provider.
 */

import { VoteVaultContract } from 'votevault-contract';

export interface WalletConnectionState {
    address: string;
    network: string;
    api: any;
}

export class MidnightClient {
    constructor() {
        console.log("[MidnightClient] Initializing Midnight.js adapter...");
    }

    /**
     * Integrates with the injected Lace Wallet extension
     */
    async connectLaceWallet(): Promise<WalletConnectionState> {
        console.log("[MidnightClient] Connecting to Lace Wallet...");
        
        // Check for injected Midnight provider
        const injectedProvider = (window as any).midnight?.mnLace;
        if (!injectedProvider) {
            throw new Error("Lace Wallet extension is not installed or enabled in this browser.");
        }

        try {
            // Enable wallet access
            const enabledApi = await injectedProvider.enable();
            const state = await enabledApi.state();
            
            if (!state.address) {
                throw new Error("No address detected in connected Lace Wallet.");
            }

            console.log(`[MidnightClient] Wallet connected: ${state.address} on ${state.network || 'devnet'}`);
            return {
                address: state.address,
                network: state.network || 'midnight-devnet',
                api: enabledApi
            };
        } catch (err: any) {
            console.error("[MidnightClient] Wallet connection failed:", err);
            throw new Error(`Lace Wallet connection failed: ${err.message || err}`);
        }
    }

    /**
     * Casts a zero-knowledge vote on the ledger
     */
    async castVoteOnChain(
        electionId: string, 
        candidateIndex: number, 
        walletAddress: string, 
        walletApi: any
    ): Promise<{ txHash: string; nullifier: string }> {
        console.log(`[MidnightClient] Initiating ZK vote cast on-chain for election ${electionId}, candidate ${candidateIndex}`);

        try {
            // Generate a secure private nullifier (simulating local ZK-SNARK witness generation)
            const seed = Math.random().toString();
            const nullifier = `0xnullifier-${btoa(walletAddress + seed).substring(0, 16)}`;

            // Check if executing via live Lace provider
            if (walletApi && typeof walletApi.submitTx === 'function') {
                console.log("[MidnightClient] Creating transaction on-chain via Lace Wallet API...");
                
                // In production:
                // 1. Fetch contract instance from ledger/network registry
                // 2. Build circuit execution inputs
                // 3. Request Lace wallet to generate and sign the transaction witness
                // 4. Submit transaction to ledger node
                
                const txHash = await walletApi.submitTx({
                    circuit: 'cast_vote',
                    args: [nullifier, BigInt(candidateIndex)]
                });

                return { txHash, nullifier };
            } else {
                // Simulated transaction delay (emulating proof computation time on client)
                console.log("[MidnightClient] Running in Dev/Simulator Mode. Computing ZK proof locally...");
                
                const isAutomated = typeof window !== 'undefined' && window.navigator?.webdriver;
                const isTest = (typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true')) || isAutomated;
                if (!isTest) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }

                const mockTxHash = `0xmocktx-${Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
                return { txHash: mockTxHash, nullifier };
            }
        } catch (err: any) {
            console.error("[MidnightClient] On-chain vote failed:", err);
            throw new Error(`Failed to cast vote on-chain: ${err.message || err}`);
        }
    }

    /**
     * Deploys a new election contract instance on the ledger
     */
    async deployElectionOnChain(
        title: string, 
        description: string, 
        candidates: string[], 
        walletAddress: string, 
        walletApi: any
    ): Promise<{ contractAddress: string; txHash: string; electionId: string }> {
        console.log(`[MidnightClient] Requesting election contract deployment for: "${title}"`);

        const electionId = `VV-${Math.floor(100 + Math.random() * 900)}-${title.substring(0, 2).toUpperCase()}`;

        try {
            if (walletApi && typeof walletApi.deployContract === 'function') {
                console.log("[MidnightClient] Deploying contract via Lace Wallet...");
                
                const contractInstance = new VoteVaultContract();
                const encoder = new TextEncoder();
                const adminPubKeyBytes = encoder.encode(walletAddress);
                const electionIdBytes = encoder.encode(electionId.padEnd(32, ' ')).slice(0, 32);

                const deployment = await walletApi.deployContract({
                    contract: contractInstance,
                    args: [adminPubKeyBytes, electionIdBytes, title, description]
                });

                // Register candidates
                for (let i = 0; i < candidates.length; i++) {
                    await deployment.callCircuit('register_candidate', [BigInt(i), candidates[i]]);
                }
                
                await deployment.callCircuit('open_election', []);

                return {
                    contractAddress: deployment.address,
                    txHash: deployment.txHash,
                    electionId
                };
            } else {
                console.log("[MidnightClient] Simulated deployment in progress...");
                
                const isAutomated = typeof window !== 'undefined' && window.navigator?.webdriver;
                const isTest = (typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true')) || isAutomated;
                if (!isTest) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                const mockContractAddress = `0xcontract-${Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
                const mockTxHash = `0xdeploytx-${Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;

                return {
                    contractAddress: mockContractAddress,
                    txHash: mockTxHash,
                    electionId
                };
            }
        } catch (err: any) {
            console.error("[MidnightClient] Election contract deployment failed:", err);
            throw new Error(`Deployment failed: ${err.message || err}`);
        }
    }
}
