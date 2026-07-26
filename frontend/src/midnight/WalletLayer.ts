import { WalletManager } from '../wallet/WalletManager';
import { WalletType, WalletAccountSession } from '../wallet/WalletTypes';

export class WalletLayer {
  private walletManager: WalletManager;

  constructor() {
    this.walletManager = WalletManager.getInstance();
  }

  async connect(walletType: WalletType): Promise<WalletAccountSession> {
    return this.walletManager.connectWallet(walletType);
  }

  getAvailableWallets() {
    return this.walletManager.getAvailableWallets();
  }

  getSavedSession(): WalletAccountSession | null {
    return this.walletManager.getStoredSession();
  }

  disconnect(): void {
    this.walletManager.disconnectSession();
  }
}
