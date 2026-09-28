import { describe, expect, it } from 'vitest';
import { createPrivateStateProvider, ensureFutureExpiry, fromHex, toHex, validateSecretHex } from '../lib/midnight';
import { createIdentity, clearIdentity, exportIdentity, importIdentity } from '../lib/identity';

describe('private material and provider lifecycle', () => {
  it('only accepts exactly 32-byte hexadecimal secrets', () => {
    expect(validateSecretHex('ab'.repeat(32))).toBe('ab'.repeat(32));
    expect(() => validateSecretHex('ab')).toThrow(/32 bytes/);
    expect(() => validateSecretHex('zz'.repeat(32))).toThrow(/32 bytes/);
    expect(toHex(fromHex('0x' + 'ab'.repeat(32)))).toBe('ab'.repeat(32));
  });

  it('does not expose identity through implicit persistence', () => {
    clearIdentity();
    const identity = createIdentity();
    expect(() => exportIdentity(identity, false)).toThrow(/Acknowledge/);
    expect(importIdentity(identity.secret, true).secret).toBe(identity.secret);
    clearIdentity();
    expect(() => exportIdentity(null, true)).toThrow(/Generate or import/);
  });

  it('scopes in-memory private state and clears it', async () => {
    const provider = createPrivateStateProvider();
    provider.setContractAddress('room-a');
    await provider.set('private', { value: 1 });
    await expect(provider.get('private')).resolves.toEqual({ value: 1 });
    provider.setContractAddress('room-b');
    await expect(provider.get('private')).resolves.toBeNull();
    await provider.clear();
    await expect(provider.get('private')).rejects.toThrow(/address/);
  });

  it('rejects expired values before a transaction is built', () => {
    expect(() => ensureFutureExpiry(101n, 100n)).not.toThrow();
    expect(() => ensureFutureExpiry(100n, 100n)).toThrow(/future/);
  });
});
