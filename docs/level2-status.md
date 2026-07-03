# VoteVault: Midnight Level 2 Compliance Status

This document reports the compliance of VoteVault with the **Midnight Network Level 2: Frontend & Wallet Integration** criteria, clearly delineating what components are production-ready (REAL) versus local development fallbacks (SIMULATED).

---

## 1. Compliance Checklist & Reality Matrix

| Requirement | Implementation State | Status / Details |
| :--- | :--- | :--- |
| **Lace Wallet Connection** | **REAL / SIMULATED FALLBACK** | API binding calls `window.midnight.mnLace.enable()` when available; otherwise simulates connection using address `'0x89FB-X12-LACE-VOTEVAULT'`. |
| **Lace Wallet Disconnection** | **REAL / SIMULATED FALLBACK** | Disconnection cleans React context state and removes session cookies. |
| **Circuit Interaction Layer** | **SIMULATED** | Scaffolded calls to `walletApi.deployContract` and `walletApi.submitTx` are present in `MidnightClient.ts`, but fall back to simulated timers when no node endpoint is bound. |
| **ZK Nullifier & Privacy Behavior** | **SIMULATED** | Creates private eligibility commitments and nullifier hashes in client memory, but actual ledger verification relies on simulator mock tallies. |
| **Frontend Integration Layer** | **REAL** | The React UI is fully wired to `VoteVaultContext.tsx` and dynamically updates states, tabs, theme choices, and forms based on the mock/live wallet API outputs. |

---

## 2. Real vs. Simulated Flows Reference

### A. Lace Wallet Connect
*   **REAL Code (`MidnightClient.ts` lines 24-48)**:
    ```typescript
    const injectedProvider = (window as any).midnight?.mnLace;
    const enabledApi = await injectedProvider.enable();
    const state = await enabledApi.state();
    return { address: state.address, network: state.network, api: enabledApi };
    ```
*   **SIMULATED Code (`VoteVaultContext.tsx` lines 152-167)**:
    If Lace is missing, the context captures the exception and connects a mock developer wallet profile:
    ```typescript
    setWalletAddress('0x89FB-X12-LACE-VOTEVAULT');
    setWalletConnected(true);
    ```

### B. Circuit Broadcasting & Proofs
*   **REAL Code (`MidnightClient.ts` lines 72-85)**:
    ```typescript
    const txHash = await walletApi.submitTx({
        circuit: 'cast_vote',
        args: [nullifier, BigInt(candidateIndex)]
    });
    ```
*   **SIMULATED Code (`MidnightClient.ts` lines 86-97)**:
    ```typescript
    // Simulated transaction delay (emulating proof computation time on client)
    const isTest = import.meta.env.MODE === 'test' || isAutomated;
    if (!isTest) {
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    const mockTxHash = `0xmocktx-${randomHex}`;
    return { txHash: mockTxHash, nullifier };
    ```
*Status: COMPLIANT WITH DEVNET SIMULATED SPECIFICATION*
