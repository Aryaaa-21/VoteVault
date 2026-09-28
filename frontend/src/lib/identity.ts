import { pureCircuits } from '../managed/contract/index.js';
import { fromHex, randomSecretHex, toHex, validateSecretHex } from './midnight';

export type PrivateIdentity = { secret: string; label: string; createdAt: number };

let activeIdentity: PrivateIdentity | null = null;

export function getIdentity(): PrivateIdentity | null {
  return activeIdentity;
}

export function createIdentity(label = 'VoteVault eligibility secret'): PrivateIdentity {
  activeIdentity = { secret: randomSecretHex(), label, createdAt: Date.now() };
  return activeIdentity;
}

export function importIdentity(secret: string, acknowledged = false, label = 'Imported VoteVault eligibility secret'): PrivateIdentity {
  if (!acknowledged) throw new Error('Acknowledge that you are importing a private secret before continuing.');
  activeIdentity = { secret: validateSecretHex(secret), label, createdAt: Date.now() };
  return activeIdentity;
}

export function exportIdentity(identity: PrivateIdentity | null, acknowledged = false): string {
  if (!identity) throw new Error('Generate or import a private secret first.');
  if (!acknowledged) throw new Error('Acknowledge that this backup contains a private secret before exporting it.');
  return identity.secret;
}

export function clearIdentity(): void {
  activeIdentity = null;
}

export function publicFingerprint(secret: string): string {
  try { return toHex((pureCircuits as any).operator_key(fromHex(validateSecretHex(secret)))); } catch { return ''; }
}

export function credentialCommitment(signal: bigint, secret: string, salt: Uint8Array): Uint8Array {
  const normalized = validateSecretHex(secret);
  if (signal < 0n) throw new Error('Private signal cannot be negative.');
  return (pureCircuits as any).credential_key(signal, fromHex(normalized), salt) as Uint8Array;
}

export function sessionReceipt(secret: string, salt: Uint8Array): Uint8Array {
  return (pureCircuits as any).make_receipt(fromHex(validateSecretHex(secret)), salt) as Uint8Array;
}

export function hasUsedCredential(secret: string, state: any): boolean {
  if (!state?.room_salt) return false;
  const target = toHex(sessionReceipt(secret, state.room_salt));
  try {
    if (state.spent_tokens?.member?.(fromHex(target))) return true;
    if (state.spent_tokens?.[Symbol.iterator]) {
      for (const value of state.spent_tokens) if (toHex(value) === target) return true;
    }
  } catch { return false; }
  return false;
}
