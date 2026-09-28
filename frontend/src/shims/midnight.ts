// Midnight SDK shims for client-side enclave and simulation mode

export const CompiledContract = {
  make: (name: string, contract: any) => ({
    name,
    contract,
    pipe: (...fns: ((c: any) => any)[]) => fns.reduce((acc, fn) => fn(acc), { name, contract }),
  }),
  withVacantWitnesses: (c: any) => c,
  withCompiledFileAssets: (url: string) => (c: any) => ({ ...c, fileAssetsUrl: url }),
};

export async function createUnprovenDeployTx(providers: any, options: any) {
  const contractAddress = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return {
    public: { contractAddress },
    private: { unprovenTx: { mock: true, options, providers } },
  };
}

export async function submitTxAsync(providers: any, txData: any) {
  const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return { txHash, txData, providers };
}

export function sampleSigningKey(): string {
  return '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export function toHex(bytes: Uint8Array | string | any): string {
  if (typeof bytes === 'string') return bytes;
  if (!bytes) return '';
  return Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const match = clean.match(/.{1,2}/g) || [];
  return new Uint8Array(match.map(byte => parseInt(byte, 16)));
}

export function setNetworkId(networkId: any) {
  return networkId;
}

export class FetchZkConfigProvider {
  constructor(public baseUrl: string, public fetchFn: any) {}
  async getZkConfig(circuitName: string) {
    return { circuit: circuitName, baseUrl: this.baseUrl };
  }
}

export const CostModel = {
  initialCostModel: () => ({}),
};

export const Transaction = {
  deserialize: (_sig: any, _proof: any, _binding: any, raw: any) => ({ raw }),
};
