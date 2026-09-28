import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  get_private_signal(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  get_room_secret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  operator_secret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  find_credential_path(context: __compactRuntime.WitnessContext<Ledger, PS>,
                       commitment_0: Uint8Array): [PS, { leaf: Uint8Array,
                                                         path: { sibling: { field: bigint
                                                                          },
                                                                 goes_left: boolean
                                                               }[]
                                                       }];
}

export type ImpureCircuits<PS> = {
  register_credential(context: __compactRuntime.CircuitContext<PS>,
                      commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  claim_pass(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  retune_room(context: __compactRuntime.CircuitContext<PS>,
              next_minimum_0: bigint,
              next_salt_0: Uint8Array,
              next_expiry_0: bigint,
              next_issuer_0: Uint8Array,
              next_limit_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  seal_room(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  unseal_room(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  register_credential(context: __compactRuntime.CircuitContext<PS>,
                      commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  claim_pass(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  retune_room(context: __compactRuntime.CircuitContext<PS>,
              next_minimum_0: bigint,
              next_salt_0: Uint8Array,
              next_expiry_0: bigint,
              next_issuer_0: Uint8Array,
              next_limit_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  seal_room(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  unseal_room(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  operator_key(secret_0: Uint8Array): Uint8Array;
  make_receipt(secret_0: Uint8Array, salt_0: Uint8Array): Uint8Array;
  credential_key(signal_0: bigint, secret_0: Uint8Array, salt_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  register_credential(context: __compactRuntime.CircuitContext<PS>,
                      commitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  claim_pass(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  retune_room(context: __compactRuntime.CircuitContext<PS>,
              next_minimum_0: bigint,
              next_salt_0: Uint8Array,
              next_expiry_0: bigint,
              next_issuer_0: Uint8Array,
              next_limit_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  seal_room(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  unseal_room(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  operator_key(context: __compactRuntime.CircuitContext<PS>,
               secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  make_receipt(context: __compactRuntime.CircuitContext<PS>,
               secret_0: Uint8Array,
               salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  credential_key(context: __compactRuntime.CircuitContext<PS>,
                 signal_0: bigint,
                 secret_0: Uint8Array,
                 salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  readonly minimum_signal: bigint;
  readonly room_salt: Uint8Array;
  readonly expiry: bigint;
  readonly issuer_id: Uint8Array;
  readonly operator_commitment: Uint8Array;
  readonly room_live: boolean;
  readonly verified_visitors: bigint;
  readonly visitor_limit: bigint;
  spent_tokens: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  receipt_book: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): Uint8Array;
    [Symbol.iterator](): Iterator<[Uint8Array, Uint8Array]>
  };
  readonly release_tag: Uint8Array;
  authorized_credentials: {
    isFull(): boolean;
    checkRoot(rt_0: { field: bigint }): boolean;
    root(): __compactRuntime.MerkleTreeDigest;
    firstFree(): bigint;
    pathForLeaf(index_0: bigint, leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array>;
    findPathForLeaf(leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array> | undefined
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               minimum_0: bigint,
               salt_0: Uint8Array,
               valid_until_0: bigint,
               issuer_0: Uint8Array,
               operator_hash_0: Uint8Array,
               limit_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
