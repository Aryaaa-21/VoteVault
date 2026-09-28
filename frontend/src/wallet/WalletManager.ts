import '@midnight-ntwrk/dapp-connector-api';
import type { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { WalletType, WalletMetadata, WalletAccountSession } from './WalletTypes';

const STORAGE_KEY = 'votevault_wallet_session';
const DEFAULT_NETWORK = 'preview';
const LEGACY_LACE_ADDRESS = '0x89FB-X12-LACE-VOTEVAULT';

type MidnightWindow = Window & {
  midnight?: Record<string, InitialAPI>;
};

/**
 * Wallet integration for VoteVault.
 *
 * Midnight wallets expose the DApp Connector API through window.midnight. The
 * keys are wallet-controlled UUIDs, so the manager deliberately enumerates
 * wallet values instead of depending on `mnLace` or another implementation
 * detail of a particular extension.
 */
export class WalletManager {
  private static instance: WalletManager;
  private activeApi: ConnectedAPI | null = null;

  public static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager();
    }
    return WalletManager.instance;
  }

  private getConfiguredNetwork(): string {
    return import.meta.env.VITE_NETWORK_ID || DEFAULT_NETWORK;
  }

  private listInjectedWallets(): InitialAPI[] {
    if (typeof window === 'undefined') return [];

    const midnight = (window as MidnightWindow).midnight;
    if (!midnight) return [];

    return Object.values(midnight).filter(
      (wallet): wallet is InitialAPI => Boolean(wallet && typeof wallet.connect === 'function'),
    );
  }

  /**
   * Wait for extension injection. Browser extensions can inject after the
   * application bundle has started, particularly in development mode.
   */
  private async waitForInjectedWallet(
    walletType: '1am' | 'lace',
    timeoutMs = 6000,
  ): Promise<InitialAPI | null> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const wallet = this.findInjectedWallet(walletType);
      if (wallet) return wallet;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return null;
  }

  private findInjectedWallet(walletType: '1am' | 'lace'): InitialAPI | null {
    const wallets = this.listInjectedWallets();
    if (wallets.length === 0) return null;

    const matchingWallet = wallets.find((wallet) => {
      const identity = `${wallet.name} ${wallet.rdns}`.toLowerCase();
      return walletType === '1am' ? identity.includes('1am') : identity.includes('lace');
    });

    // A wallet with no identifying metadata is still usable when it is the
    // only injected Midnight wallet (useful for compatible wallet versions).
    const onlyWallet = wallets.length === 1 ? wallets[0] : null;
    const hasNoIdentity = onlyWallet && !onlyWallet.name && !onlyWallet.rdns;
    return matchingWallet ?? (hasNoIdentity ? onlyWallet : null);
  }

  private async connectInjectedWallet(
    wallet: InitialAPI,
    walletType: '1am' | 'lace',
  ): Promise<WalletAccountSession> {
    const network = this.getConfiguredNetwork();
    const api = await wallet.connect(network);
    const [addressResult, configuration] = await Promise.all([
      api.getUnshieldedAddress(),
      api.getConfiguration(),
    ]);
    const address = addressResult?.unshieldedAddress;

    if (!address) {
      throw new Error(`No unshielded address was returned by the ${wallet.name || walletType} wallet.`);
    }

    this.activeApi = api;
    const session: WalletAccountSession = {
      address,
      network: configuration?.networkId || network,
      walletType,
      connectedAt: new Date().toISOString(),
      api,
    };

    this.saveSession(session);
    return session;
  }

  /**
   * List supported wallet options with live DApp Connector detection.
   */
  public getAvailableWallets(): WalletMetadata[] {
    const injectedWallets = this.listInjectedWallets();
    const has1am = injectedWallets.some((wallet) =>
      `${wallet.name} ${wallet.rdns}`.toLowerCase().includes('1am'),
    );
    const hasEthereum = typeof window !== 'undefined' && Boolean((window as any).ethereum);

    return [
      {
        id: '1am',
        name: '1AM Wallet',
        icon: 'https://1am.network/favicon.ico',
        description: 'Native Midnight wallet with dust-sponsored proving and transactions.',
        isAvailable: has1am,
        badge: has1am ? 'Installed' : 'Not detected',
      },
      {
        id: 'metamask',
        name: 'MetaMask / EVM Injected',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
        description: 'Injected Web3 browser provider.',
        isAvailable: hasEthereum,
        badge: hasEthereum ? 'Installed' : 'Not detected',
      },
      {
        id: 'walletconnect',
        name: 'WalletConnect 2.0',
        icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Gradient/Icon.svg',
        description: 'Mobile QR code and multi-chain protocol bridge.',
        isAvailable: true,
        badge: 'Bridge',
      },
      {
        id: 'developer',
        name: 'Developer Enclave Keypair',
        icon: 'code',
        description: 'Admin keypair for local circuit validation.',
        isAvailable: true,
        badge: 'Dev Enclave',
      },
    ];
  }

  /** The currently connected wallet API, if this page has an active session. */
  public getActiveApi(): ConnectedAPI | null {
    return this.activeApi;
  }

  /**
   * Connect to a wallet provider.
   *
   * The 1AM path uses the standard Midnight DApp Connector API. The legacy
   * Lace path remains only so older local tests/integrations can migrate
   * without a breaking type change; the UI no longer presents it.
   */
  public async connectWallet(type: WalletType): Promise<WalletAccountSession> {
    console.log(`[WalletManager] Connecting to provider: ${type}...`);

    try {
      if (type === '1am' || type === 'lace') {
        const injectedWallet = this.findInjectedWallet(type);

        if (injectedWallet) {
          return this.connectInjectedWallet(injectedWallet, type);
        }

        if (type === '1am') {
          // Give a late-injecting extension a chance before reporting failure.
          const delayedWallet = await this.waitForInjectedWallet('1am');
          if (delayedWallet) return this.connectInjectedWallet(delayedWallet, '1am');
          throw new Error('1AM Wallet was not detected. Install and unlock the 1AM browser extension, then try again.');
        }

        // Backwards-compatible local-only behavior for old Lace test flows.
        this.activeApi = null;
        const session: WalletAccountSession = {
          address: LEGACY_LACE_ADDRESS,
          network: 'midnight-preprod',
          walletType: 'lace',
          connectedAt: new Date().toISOString(),
          api: null,
        };
        this.saveSession(session);
        return session;
      }

      // These providers are retained as local/demo adapters until their
      // chain-specific transaction implementations are enabled.
      this.activeApi = null;
      let address = LEGACY_LACE_ADDRESS;
      if (type === 'metamask') {
        address = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
      } else if (type === 'walletconnect') {
        address = '0xWC-99A1-2C5E-88D2-MIDNIGHT';
      } else if (type === 'developer') {
        address = '0xDEV-ADMIN-KEY-0X12345';
      } else if (type === 'simulated' || type === 'demo') {
        address = '0xSIMULATED-VOTEVAULT-WALLET';
      }

      const session: WalletAccountSession = {
        address,
        network: 'midnight-preprod',
        walletType: type,
        connectedAt: new Date().toISOString(),
        api: null,
      };

      this.saveSession(session);
      return session;
    } catch (err: any) {
      console.error(`[WalletManager] Failed to connect wallet ${type}:`, err);
      throw new Error(err?.message || `Failed to connect ${type} wallet.`);
    }
  }

  private saveSession(session: WalletAccountSession): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedData = { ...session, api: undefined };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
      }
    } catch (e) {
      console.warn('[WalletManager] Failed to persist session to localStorage', e);
    }
  }

  public getStoredSession(): WalletAccountSession | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as WalletAccountSession;
      }
    } catch (e) {
      console.warn('[WalletManager] Failed to read stored session', e);
    }
    return null;
  }

  public disconnectSession(): void {
    this.activeApi = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('[WalletManager] Failed to clear session', e);
    }
  }
}
