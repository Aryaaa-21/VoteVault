import { normalizeTxId, waitForIndexedTx, isSuccessfulIndexedTx } from './midnight';

export type SubmissionState = 'idle' | 'submitting' | 'submitted' | 'indexed' | 'failed';

export function parseTransactionId(value: unknown): string {
  const id = normalizeTxId(value);
  if (!id || id === 'undefined' || id === 'null') throw new Error('The wallet did not return a transaction identifier.');
  return id;
}

export function validateUint(value: string, label: string, options: { min?: bigint; max?: bigint } = {}): bigint {
  if (!/^\d+$/.test(value.trim())) throw new Error(`${label} must be a whole number.`);
  const parsed = BigInt(value);
  if (options.min !== undefined && parsed < options.min) throw new Error(`${label} must be at least ${options.min}.`);
  if (options.max !== undefined && parsed > options.max) throw new Error(`${label} must be at most ${options.max}.`);
  return parsed;
}

export async function waitForIndexedConfirmation(
  provider: { watchForTxData: (txId: string) => Promise<any> },
  txId: string,
  timeoutMs = 45_000,
): Promise<{ txId: string; indexed: boolean; successful: boolean; data?: any }> {
  const result = await waitForIndexedTx(provider, txId, timeoutMs);
  return { txId, indexed: result.indexed, successful: result.indexed && isSuccessfulIndexedTx(result.data), data: result.data };
}

export async function preflightArtifacts(
  fetcher: typeof fetch,
  baseUrl: string,
  circuitIds: readonly string[],
): Promise<void> {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const required = circuitIds.flatMap((circuitId) => [`zkir/${circuitId}.bzkir`, `keys/${circuitId}.prover`, `keys/${circuitId}.verifier`]);
  const results = await Promise.all(required.map(async (path) => {
    const response = await fetcher(new URL(path, base));
    return { path, ok: response.ok };
  }));
  const missing = results.filter((result) => !result.ok).map((result) => result.path);
  if (missing.length) throw new Error(`Missing compiled artifact(s): ${missing.join(', ')}`);
}
