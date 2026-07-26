import { WalletType, WalletMetadata, WalletAccountSession } from './WalletTypes';

const STORAGE_KEY = 'votevault_wallet_session';

export class WalletManager {
  private static instance: WalletManager;

  public static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager();
    }
    return WalletManager.instance;
  }

  /**
   * List available wallet options in client environment
   */
  public getAvailableWallets(): WalletMetadata[] {
    const isWindowDefined = typeof window !== 'undefined';
    const hasLace = isWindowDefined && Boolean((window as any).midnight?.mnLace);
    const hasEthereum = isWindowDefined && Boolean((window as any).ethereum);
    const hasPhantom = isWindowDefined && Boolean((window as any).phantom?.solana);

    return [
      {
        id: 'lace',
        name: 'Lace Wallet',
        icon: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVxuj5HJL6XFKeQTv9X8S0_XoNs9q2yO46lzynIWnmPxN71a56My_hWXi820ZMW5vQd11zLRfs8Z-u8Ibrbux3ltYJ99qjl0QyORFqLziwQMQU2_Hc7cWte7fnv4Grk6Zj5n9nnp90ib6ZKhjJVXQ0zpJw8CKBcJq6OYF-dsmz056qHAO98YovdTUgcUL9bcEJ6GzSVERyGH8QqBDW73EHN4yau1tso6zWFq8IU6M4EB1Fa2Vt_u3w',
        description: 'Official Midnight & Cardano Native Wallet Provider',
        isAvailable: hasLace || true, // Fallback enabled for dev demo
        badge: hasLace ? 'Detected' : 'Native SDK'
      },
      {
        id: 'metamask',
        name: 'MetaMask / EVM Injected',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
        description: 'Injected Web3 Browser Provider',
        isAvailable: hasEthereum || true,
        badge: hasEthereum ? 'Injected' : 'Compatible'
      },
      {
        id: 'walletconnect',
        name: 'WalletConnect 2.0',
        icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Gradient/Icon.svg',
        description: 'Mobile QR Code & Multi-Chain Protocol Bridge',
        isAvailable: true,
        badge: 'Bridge'
      },
      {
        id: 'phantom',
        name: 'Phantom / Generic',
        icon: 'https://phantom.app/img/phantom-logo.svg',
        description: 'Generic Web3 Browser Extension Provider',
        isAvailable: hasPhantom || true,
        badge: 'Generic'
      },
      {
        id: 'developer',
        name: 'Developer Keypair',
        icon: 'code',
        description: 'Admin keypair for local testnet circuit validation',
        isAvailable: true,
        badge: 'Dev Mode'
      },
      {
        id: 'simulated',
        name: 'Local Enclave Simulator',
        icon: 'memory',
        description: 'Client-side zero-knowledge witness simulator enclave',
        isAvailable: true,
        badge: 'Simulation'
      }
    ];
  }

  /**
   * Connect to specified wallet provider
   */
  public async connectWallet(type: WalletType): Promise<WalletAccountSession> {
    console.log(`[WalletManager] Connecting to provider: ${type}...`);

    try {
      if (type === 'lace' && typeof window !== 'undefined' && (window as any).midnight?.mnLace) {
        const injectedProvider = (window as any).midnight.mnLace;
        const api = await injectedProvider.enable();
        const state = await api.state();
        
        const session: WalletAccountSession = {
          address: state.address || '0x89FB-X12-LACE-VOTEVAULT',
          network: state.network || 'midnight-devnet',
          walletType: 'lace',
          connectedAt: new Date().toISOString(),
          api
        };

        this.saveSession(session);
        return session;
      }

      // Simulated latency for high-quality feel
      const isAutomated = typeof window !== 'undefined' && window.navigator?.webdriver;
      const isTest = import.meta.env.MODE === 'test' || isAutomated;
      if (!isTest) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      let address = '';
      if (type === 'lace') {
        address = '0x89FB-X12-LACE-VOTEVAULT';
      } else if (type === 'metamask') {
        address = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
      } else if (type === 'walletconnect') {
        address = '0xWC-99A1-2C5E-88D2-MIDNIGHT';
      } else if (type === 'phantom') {
        address = '0xPHANTOM-98A1-8812-VV';
      } else if (type === 'developer') {
        address = '0xDEV-ADMIN-KEY-0X12345';
      } else {
        address = '0xSIMULATOR-WITNESS-ENCLAVE-8890';
      }

      const session: WalletAccountSession = {
        address,
        network: 'devnet-simulated',
        walletType: type,
        connectedAt: new Date().toISOString(),
        api: null
      };

      this.saveSession(session);
      return session;
    } catch (err: any) {
      console.error(`[WalletManager] Failed to connect wallet ${type}:`, err);
      throw new Error(err?.message || `Failed to connect ${type} wallet.`);
    }
  }

  /**
   * Persist session to local storage for auto-reconnect
   */
  private saveSession(session: WalletAccountSession): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedData = { ...session, api: undefined }; // do not serialize API object
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
      }
    } catch (e) {
      console.warn('[WalletManager] Failed to persist session to localStorage', e);
    }
  }

  /**
   * Recover session on app reload
   */
  public getStoredSession(): WalletAccountSession | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      }
    } catch (e) {
      console.warn('[WalletManager] Failed to read stored session', e);
    }
    return null;
  }

  /**
   * Disconnect & clear session
   */
  public disconnectSession(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('[WalletManager] Failed to clear session', e);
    }
  }
}
