import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountKitService } from '../account-kit.service';
import { WalletConnectComponent } from '../wallet-connect/wallet-connect.component';

@Component({
  selector: 'app-home',
  imports: [FormsModule, WalletConnectComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private accountKitService = inject(AccountKitService);

  protected account = this.accountKitService.account;
  protected email = '';
  protected otpCode = '';
  protected isAuthenticating = false;
  protected authStep: 'email' | 'otp' | null = null;

  // Transaction fields
  protected toAddress = '';
  protected amount = '';
  protected isSendingTx = false;
  protected balance: string | null = null;

  protected async sendOtp() {
    if (!this.email.trim()) return;

    this.isAuthenticating = true;
    try {
      await this.accountKitService.authenticateWithEmail(this.email);
      this.authStep = 'otp';
    } catch (error) {
      console.error('Failed to send OTP:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      this.isAuthenticating = false;
    }
  }

  protected async verifyOtp() {
    if (!this.otpCode.trim()) return;

    this.isAuthenticating = true;
    try {
      await this.accountKitService.authenticateWithOtp(this.otpCode);
      this.authStep = null;
      this.email = '';
      this.otpCode = '';
      alert('Successfully authenticated!');
      await this.loadBalance();
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      alert('Invalid OTP code. Please try again.');
    } finally {
      this.isAuthenticating = false;
    }
  }

  protected resetAuth() {
    this.authStep = null;
    this.email = '';
    this.otpCode = '';
  }

  protected async sendTransaction() {
    if (!this.toAddress.trim() || !this.amount.trim()) return;

    this.isSendingTx = true;
    try {
      const hash = await this.accountKitService.sendTransaction(this.toAddress, this.amount);
      alert(`Transaction sent! Hash: ${hash}`);
      this.toAddress = '';
      this.amount = '';
      await this.loadBalance();
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      this.isSendingTx = false;
    }
  }

  protected async loadBalance() {
    try {
      const balance = await this.accountKitService.getBalance();
      this.balance = balance.toString();
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  }

  protected connectWallet() {
    // TODO: Implement wallet connection
    console.log('Connect wallet clicked');
  }

  protected disconnectWallet() {
    // TODO: Implement wallet disconnection
    console.log('Disconnect wallet clicked');
  }
}
