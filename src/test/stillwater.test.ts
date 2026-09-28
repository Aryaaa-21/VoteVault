import { beforeEach, describe, expect, it } from 'vitest';
import crypto from 'node:crypto';
import {
  createCircuitContext,
  createConstructorContext,
  dummyContractAddress,
  sampleUserAddress,
} from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger, pureCircuits } from '../../contracts/managed/stillwater/contract/index.js';
import type { Ledger } from '../../contracts/managed/stillwater/contract/index.js';

type Credential = { signal: bigint; secret: Uint8Array; commitment: Uint8Array };
const bytes = () => new Uint8Array(crypto.randomBytes(32));
const now = () => Math.floor(Date.now() / 1000);

const makeCredential = (salt: Uint8Array, signal = 90n, secret = bytes()): Credential => ({
  signal,
  secret,
  commitment: pureCircuits.credential_key(signal, secret, salt),
});

const pathFor = (state: any, commitment: Uint8Array) => {
  const path = ledger(state).authorized_credentials.findPathForLeaf(commitment);
  if (!path) throw new Error('test fixture did not register credential');
  return path;
};

describe('VoteVault Compact contract', () => {
  let contract: Contract;
  let state: any;
  let salt: Uint8Array;
  let operatorSecret: Uint8Array;
  let expiry: bigint;
  const address = dummyContractAddress();
  const coin = sampleUserAddress();

  const context = (at = now()) => createCircuitContext(address, coin, state, {}, undefined, undefined, at);
  const witnesses = (credential?: Credential, pathOverride?: any, operator = operatorSecret) => ({
    get_private_signal: () => [{}, credential?.signal ?? 90n],
    get_room_secret: () => [{}, credential?.secret ?? bytes()],
    operator_secret: () => [{}, operator],
    find_credential_path: (_ctx: any, commitment: Uint8Array) => [{}, pathOverride ?? pathFor(state, commitment)],
  } as any);
  const apply = (result: any) => { state = result.context.currentQueryContext.state; return result; };

  beforeEach(() => {
    salt = bytes();
    operatorSecret = bytes();
    expiry = BigInt(now() + 86_400);
    contract = new Contract(witnesses());
    const operatorCommitment = pureCircuits.operator_key(operatorSecret);
    state = contract.initialState(
      createConstructorContext({}, coin),
      72n,
      salt,
      expiry,
      bytes(),
      operatorCommitment,
      3n,
    ).currentContractState.data;
  });

  it('starts with the VoteVault public ABI and an empty Merkle tree', () => {
    const value = ledger(state);
    expect(value.minimum_signal).toBe(72n);
    expect(value.room_live).toBe(true);
    expect(value.verified_visitors).toBe(0n);
    expect(value.visitor_limit).toBe(3n);
    expect(value.authorized_credentials.isFull()).toBe(false);
    expect(value.release_tag).toEqual(new TextEncoder().encode('stillwater:allowlist:v1'.padEnd(32, '\0')));
  });

  it('allows only the operator to enroll a credential and then proves anonymous membership', () => {
    const member = makeCredential(salt);
    contract.witnesses = witnesses(undefined, undefined, operatorSecret);
    apply(contract.circuits.register_credential(context(), member.commitment));
    expect(ledger(state).authorized_credentials.findPathForLeaf(member.commitment)).toBeDefined();

    contract.witnesses = witnesses(member);
    apply(contract.circuits.claim_pass(context()));
    expect(ledger(state).verified_visitors).toBe(1n);
  });

  it('rejects unauthorized credentials and binds the path leaf to score, secret and room salt', () => {
    const approved = makeCredential(salt);
    apply(contract.circuits.register_credential(context(), approved.commitment));

    const unauthorized = makeCredential(salt, 91n);
    contract.witnesses = witnesses(unauthorized, pathFor(state, approved.commitment));
    expect(() => contract.circuits.claim_pass(context())).toThrow(/path does not match/i);

    const alteredScore = { ...approved, signal: 91n, commitment: pureCircuits.credential_key(91n, approved.secret, salt) };
    contract.witnesses = witnesses(alteredScore, pathFor(state, approved.commitment));
    expect(() => contract.circuits.claim_pass(context())).toThrow(/path does not match/i);

    const alteredSecret = makeCredential(salt, approved.signal);
    contract.witnesses = witnesses(alteredSecret, pathFor(state, approved.commitment));
    expect(() => contract.circuits.claim_pass(context())).toThrow(/path does not match/i);

    const malformedPath = { ...pathFor(state, approved.commitment), leaf: bytes() };
    contract.witnesses = witnesses(approved, malformedPath);
    expect(() => contract.circuits.claim_pass(context())).toThrow(/path does not match/i);
  });

  it('rejects a fabricated authorized root even when the supplied leaf matches the credential', () => {
    const approved = makeCredential(salt);
    const outsider = makeCredential(salt);
    apply(contract.circuits.register_credential(context(), approved.commitment));
    contract.witnesses = witnesses(outsider, { ...pathFor(state, approved.commitment), leaf: outsider.commitment });
    expect(() => contract.circuits.claim_pass(context())).toThrow(/not authorized/i);
    expect(ledger(state).verified_visitors).toBe(0n);
  });

  it.each(['sibling', 'direction', 'length'] as const)('rejects an altered path %s', (change) => {
    const member = makeCredential(salt);
    apply(contract.circuits.register_credential(context(), member.commitment));
    const path = structuredClone(pathFor(state, member.commitment));
    if (change === 'sibling') path.path[0].sibling.field += 1n;
    if (change === 'direction') path.path[0].goes_left = !path.path[0].goes_left;
    if (change === 'length') path.path.pop();
    contract.witnesses = witnesses(member, path);
    expect(() => contract.circuits.claim_pass(context())).toThrow(/not authorized|expected.*MerkleTreePath/i);
    expect(ledger(state).verified_visitors).toBe(0n);
  });

  it('rejects a stale path after enrollment updates the current root, then accepts a refreshed path', () => {
    const member = makeCredential(salt);
    apply(contract.circuits.register_credential(context(), member.commitment));
    const oldPath = pathFor(state, member.commitment);
    apply(contract.circuits.register_credential(context(), makeCredential(salt).commitment));
    contract.witnesses = witnesses(member, oldPath);
    expect(() => contract.circuits.claim_pass(context())).toThrow(/not authorized/i);
    contract.witnesses = witnesses(member);
    apply(contract.circuits.claim_pass(context()));
    expect(ledger(state).verified_visitors).toBe(1n);
  });

  it('rejects a below-threshold signal before membership can be claimed', () => {
    const approved = makeCredential(salt);
    apply(contract.circuits.register_credential(context(), approved.commitment));
    const low = makeCredential(salt, 20n, approved.secret);
    contract.witnesses = witnesses(low, pathFor(state, approved.commitment));
    expect(() => contract.circuits.claim_pass(context())).toThrow(/Private signal/);
  });

  it('prevents replay of a one-time room receipt', () => {
    const member = makeCredential(salt);
    apply(contract.circuits.register_credential(context(), member.commitment));
    contract.witnesses = witnesses(member);
    apply(contract.circuits.claim_pass(context()));
    expect(() => contract.circuits.claim_pass(context())).toThrow(/already used/i);
    expect(ledger(state).spent_tokens.size()).toBe(1n);
    expect(ledger(state).receipt_book.size()).toBe(1n);
  });

  it('rejects a fourth distinct approved member at capacity without modifying the count', () => {
    const members = Array.from({ length: 4 }, () => makeCredential(salt));
    for (const member of members) apply(contract.circuits.register_credential(context(), member.commitment));
    for (const member of members.slice(0, 3)) {
      contract.witnesses = witnesses(member);
      apply(contract.circuits.claim_pass(context()));
    }
    contract.witnesses = witnesses(members[3]);
    expect(() => contract.circuits.claim_pass(context())).toThrow(/Visitor capacity reached/);
    expect(ledger(state).verified_visitors).toBe(3n);
  });

  it('enforces the 1,024-leaf enrollment capacity even across retunes', () => {
    for (let i = 0; i < 1024; i++) apply(contract.circuits.register_credential(context(), bytes()));
    expect(ledger(state).authorized_credentials.firstFree()).toBe(1024n);
    expect(ledger(state).authorized_credentials.isFull()).toBe(true);
    expect(() => contract.circuits.register_credential(context(), bytes())).toThrow(/Credential capacity reached/);
    apply(contract.circuits.retune_room(context(), 75n, bytes(), expiry, bytes(), 1024n));
    expect(() => contract.circuits.register_credential(context(), bytes())).toThrow(/Credential capacity reached/);
  });

  it('does not let an operator lower capacity below existing claims', () => {
    for (const member of [makeCredential(salt), makeCredential(salt)]) {
      apply(contract.circuits.register_credential(context(), member.commitment));
      contract.witnesses = witnesses(member);
      apply(contract.circuits.claim_pass(context()));
    }
    contract.witnesses = witnesses(undefined, undefined, operatorSecret);
    expect(() => contract.circuits.retune_room(context(), 72n, bytes(), expiry, bytes(), 1n)).toThrow(/capacity cannot be below/i);
  });

  it('retunes public rules without erasing the append-only tree or spent receipts', () => {
    const member = makeCredential(salt);
    apply(contract.circuits.register_credential(context(), member.commitment));
    contract.witnesses = witnesses(member);
    apply(contract.circuits.claim_pass(context()));
    const nextSalt = bytes();
    contract.witnesses = witnesses(undefined, undefined, operatorSecret);
    apply(contract.circuits.retune_room(context(), 75n, nextSalt, expiry, bytes(), 3n));
    expect(ledger(state).verified_visitors).toBe(1n);
    expect(ledger(state).spent_tokens.size()).toBe(1n);
    expect(ledger(state).authorized_credentials.findPathForLeaf(member.commitment)).toBeDefined();
    const nextMember = makeCredential(nextSalt, 80n, member.secret);
    apply(contract.circuits.register_credential(context(), nextMember.commitment));
    contract.witnesses = witnesses(nextMember);
    apply(contract.circuits.claim_pass(context()));
    expect(ledger(state).verified_visitors).toBe(2n);
    // Restoring an earlier salt is not a replay reset.
    apply(contract.circuits.retune_room(context(), 72n, salt, expiry, bytes(), 3n));
    contract.witnesses = witnesses(member);
    expect(() => contract.circuits.claim_pass(context())).toThrow(/already used/i);
    expect(ledger(state).receipt_book.size()).toBe(2n);
  });

  it('requires a fresh operator enrollment after changing salt', () => {
    const member = makeCredential(salt);
    apply(contract.circuits.register_credential(context(), member.commitment));
    const oldPath = pathFor(state, member.commitment);
    apply(contract.circuits.retune_room(context(), 72n, bytes(), expiry, bytes(), 3n));
    contract.witnesses = witnesses(member, oldPath);
    expect(() => contract.circuits.claim_pass(context())).toThrow(/path does not match/i);
  });

  it('retuning the same salt does not erase spends or silently reset the lifetime count', () => {
    const member = makeCredential(salt);
    apply(contract.circuits.register_credential(context(), member.commitment));
    contract.witnesses = witnesses(member);
    apply(contract.circuits.claim_pass(context()));
    apply(contract.circuits.retune_room(context(), 72n, salt, expiry, bytes(), 3n));
    expect(() => contract.circuits.claim_pass(context())).toThrow(/already used/i);
    expect(ledger(state).verified_visitors).toBe(1n);
  });

  it('enforces expiry on claims and reopening', () => {
    const member = makeCredential(salt);
    apply(contract.circuits.register_credential(context(), member.commitment));
    contract.witnesses = witnesses(member);
    expect(() => contract.circuits.claim_pass(context(Number(expiry)))).toThrow(/expired/i);
    expect(() => contract.circuits.claim_pass(context(Number(expiry + 1n)))).toThrow(/expired/i);
    expect(() => contract.circuits.register_credential(context(Number(expiry)), bytes())).toThrow(/expired/i);

    contract.witnesses = witnesses(undefined, undefined, operatorSecret);
    apply(contract.circuits.seal_room(context()));
    expect(() => contract.circuits.unseal_room(context(Number(expiry + 1n)))).toThrow(/expired/i);
  });

  it('enforces operator authorization on enrollment and lifecycle controls', () => {
    const member = makeCredential(salt);
    const wrongSecret = bytes();
    contract.witnesses = witnesses(undefined, undefined, wrongSecret);
    expect(() => contract.circuits.register_credential(context(), member.commitment)).toThrow(/authorization/i);
    expect(() => contract.circuits.seal_room(context())).toThrow(/authorization/i);
    expect(() => contract.circuits.unseal_room(context())).toThrow(/authorization/i);
    expect(() => contract.circuits.retune_room(context(), 73n, bytes(), expiry, bytes(), 3n)).toThrow(/authorization/i);

    contract.witnesses = witnesses(undefined, undefined, operatorSecret);
    apply(contract.circuits.seal_room(context()));
    expect(ledger(state).room_live).toBe(false);
    expect(() => contract.circuits.claim_pass(context())).toThrow(/sealed/i);
    // Enrollment while sealed is allowed, so an operator can prepare the set.
    apply(contract.circuits.register_credential(context(), member.commitment));
    apply(contract.circuits.unseal_room(context()));
    expect(ledger(state).room_live).toBe(true);
  });

  it('validates constructor rules and domain-separated pure commitments', () => {
    const operatorCommitment = pureCircuits.operator_key(operatorSecret);
    expect(() => contract.initialState(createConstructorContext({}, coin), 0n, salt, expiry, bytes(), operatorCommitment, 3n)).toThrow(/positive/i);
    expect(() => contract.initialState(createConstructorContext({}, coin), 72n, salt, BigInt(now() - 1), bytes(), operatorCommitment, 3n)).toThrow(/future|expired/i);
    expect(() => contract.initialState(createConstructorContext({}, coin), 72n, salt, expiry, bytes(), operatorCommitment, 0n)).toThrow(/between/i);

    const otherSalt = bytes();
    const secret = bytes();
    expect(pureCircuits.credential_key(90n, secret, salt)).not.toEqual(pureCircuits.credential_key(91n, secret, salt));
    expect(pureCircuits.credential_key(90n, secret, salt)).not.toEqual(pureCircuits.credential_key(90n, secret, otherSalt));
    expect(pureCircuits.make_receipt(secret, salt)).not.toEqual(pureCircuits.credential_key(90n, secret, salt));
  });
});
