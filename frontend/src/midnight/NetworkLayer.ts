export interface NetworkStatus {
  nodeUrl: string;
  proofServerUrl: string;
  isConnected: boolean;
  blockHeight: number;
  networkName: string;
}

export class NetworkLayer {
  private nodeUrl: string;
  private proofServerUrl: string;

  constructor() {
    this.nodeUrl = import.meta.env.VITE_MIDNIGHT_NODE_URL || 'http://localhost:8080';
    this.proofServerUrl = import.meta.env.VITE_PROOF_SERVER_URL || 'http://localhost:5001';
  }

  public async getStatus(): Promise<NetworkStatus> {
    return {
      nodeUrl: this.nodeUrl,
      proofServerUrl: this.proofServerUrl,
      isConnected: false, // Local simulation default
      blockHeight: 1849204,
      networkName: 'midnight-devnet-simulated'
    };
  }
}
