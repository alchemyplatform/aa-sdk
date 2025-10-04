import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletService, WalletConnection } from '../wallet.service';

@Component({
  selector: 'app-wallet-connect',
  imports: [CommonModule],
  templateUrl: './wallet-connect.html',
  styleUrl: './wallet-connect.scss'
})
export class WalletConnectComponent {
  private walletService = inject(WalletService);

  protected connection: WalletConnection | null = null;
  protected isConnecting = false;
  protected connectingWallet: string | null = null;

  constructor() {
    this.walletService.connection$.subscribe((connection: WalletConnection | null) => {
      this.connection = connection;
    });
  }

  protected async connectWallet(walletType: string) {
    this.isConnecting = true;
    this.connectingWallet = walletType;

    try {
      switch (walletType) {
        case 'metamask':
          await this.walletService.connectMetaMask();
          break;
        case 'coinbase':
          await this.walletService.connectCoinbaseWallet();
          break;
        case 'walletconnect':
          await this.walletService.connectWalletConnect();
          break;
        case 'injected':
          await this.walletService.connectInjected();
          break;
      }
    } catch (error) {
      console.error(`Failed to connect ${walletType}:`, error);
      alert(`Failed to connect ${walletType}. Please try again.`);
    } finally {
      this.isConnecting = false;
      this.connectingWallet = null;
    }
  }

  protected async disconnectWallet() {
    try {
      await this.walletService.disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect:', error);
      alert('Failed to disconnect. Please try again.');
    }
  }

  protected getWalletIcon(walletType: string): string {
    switch (walletType) {
      case 'metamask':
        return '🦊';
      case 'coinbase':
        return '📱';
      case 'walletconnect':
        return '🔗';
      case 'injected':
        return '💎';
      default:
        return '👛';
    }
  }

  protected getWalletName(walletType: string): string {
    switch (walletType) {
      case 'metamask':
        return 'MetaMask';
      case 'coinbase':
        return 'Coinbase Wallet';
      case 'walletconnect':
        return 'WalletConnect';
      case 'injected':
        return 'Browser Wallet';
      default:
        return 'Wallet';
    }
  }
}
