import { describe, expect, it, vi } from 'vitest';
import { parseTransactionId, preflightArtifacts, validateUint, waitForIndexedConfirmation } from '../lib/transactions';

describe('transaction and input guards', () => {
  it('rejects missing or malformed transaction identifiers', () => {
    expect(() => parseTransactionId(undefined)).toThrow(/identifier/);
    expect(parseTransactionId({ transactionId: 'tx-123' })).toBe('tx-123');
    expect(parseTransactionId('tx-456')).toBe('tx-456');
  });

  it('validates unsigned integer form and bounds', () => {
    expect(validateUint('12', 'limit', { min: 1n, max: 20n })).toBe(12n);
    expect(() => validateUint('-1', 'limit')).toThrow(/whole number/);
    expect(() => validateUint('21', 'limit', { max: 20n })).toThrow(/at most/);
  });

  it('reports missing compiled artifacts before deployment', async () => {
    const fetcher = vi.fn(async (url: URL) => ({ ok: !url.pathname.includes('claim_pass.prover') } as Response));
    await expect(preflightArtifacts(fetcher as typeof fetch, 'https://app.example/managed/', ['claim_pass'])).rejects.toThrow(/claim_pass\.prover/);
  });

  it('distinguishes submitted from indexed and failed transactions', async () => {
    const provider = { watchForTxData: vi.fn(async () => ({ status: 'SucceedEntirely' })) };
    await expect(waitForIndexedConfirmation(provider, 'tx-1', 100)).resolves.toMatchObject({ txId: 'tx-1', indexed: true, successful: true });
    const failed = { watchForTxData: vi.fn(async () => ({ status: 'FailFallible' })) };
    await expect(waitForIndexedConfirmation(failed, 'tx-2', 100)).resolves.toMatchObject({ indexed: true, successful: false });
  });
});
