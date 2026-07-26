export type WalletType = 
  | 'lace' 
  | 'metamask' 
  | 'walletconnect' 
  | 'phantom' 
  | 'developer' 
  | 'demo' 
  | 'simulated';

export interface WalletMetadata {
  id: WalletType;
  name: string;
  icon: string;
  description: string;
  isAvailable: boolean;
  badge?: string;
}

export interface WalletAccountSession {
  address: string;
  network: string;
  walletType: WalletType;
  connectedAt: string;
  api?: any;
}
