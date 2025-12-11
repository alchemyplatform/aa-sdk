import { Injectable } from '@angular/core';
import { createConfig, connect, disconnect, getAccount, watchAccount, type Config, http, type GetAccountReturnType } from '@wagmi/core';
import { metaMask, coinbaseWallet, walletConnect, injected } from '@wagmi/connectors';
import { sepolia } from 'viem/chains';
import { BehaviorSubject } from 'rxjs';

export interface WalletConnection {
  address: string;
  connector: string;
  chainId: number;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private wagmiConfig: Config;
  private connectionSubject = new BehaviorSubject<WalletConnection | null>(null);

  public connection$ = this.connectionSubject.asObservable();

  constructor() {
    // Create wagmi config with multiple connectors
    this.wagmiConfig = createConfig({
      chains: [sepolia],
      connectors: [
        metaMask(),
        coinbaseWallet({
          appName: 'Smart Wallets Angular Demo'
        }),
        walletConnect({
          projectId: 'demo-project-id', // Replace with actual project ID
          showQrModal: true
        }),
        injected() // For other injected wallets
      ],
      transports: {
        [sepolia.id]: http()
      }
    });

    // Watch for account changes
    watchAccount(this.wagmiConfig, {
      onChange: (account: any) => {
        if (account.address && account.connector) {
          this.connectionSubject.next({
            address: account.address,
            connector: account.connector.name,
            chainId: account.chainId || sepolia.id
          });
        } else {
          this.connectionSubject.next(null);
        }
      }
    });
  }

  async connectMetaMask(): Promise<void> {
    try {
      await connect(this.wagmiConfig, { connector: metaMask() });
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      throw error;
    }
  }

  async connectCoinbaseWallet(): Promise<void> {
    try {
      await connect(this.wagmiConfig, { connector: coinbaseWallet({ appName: 'Smart Wallets Angular Demo' }) });
    } catch (error) {
      console.error('Coinbase Wallet connection failed:', error);
      throw error;
    }
  }

  async connectWalletConnect(): Promise<void> {
    try {
      await connect(this.wagmiConfig, {
        connector: walletConnect({
          projectId: 'demo-project-id', // Replace with actual project ID
          showQrModal: true
        })
      });
    } catch (error) {
      console.error('WalletConnect connection failed:', error);
      throw error;
    }
  }

  async connectInjected(): Promise<void> {
    try {
      await connect(this.wagmiConfig, { connector: injected() });
    } catch (error) {
      console.error('Injected wallet connection failed:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      await disconnect(this.wagmiConfig);
    } catch (error) {
      console.error('Disconnect failed:', error);
      throw error;
    }
  }

  getCurrentConnection(): WalletConnection | null {
    return this.connectionSubject.value;
  }

  getAvailableConnectors() {
    return this.wagmiConfig.connectors;
  }
}
