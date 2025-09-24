import { Injectable, signal } from '@angular/core';
import {
  createConfig,
  getAccount,
  watchAccount,
  getSigner,
  getSmartAccountClient,
  AlchemyAccountsConfig,
  GetAccountResult
} from '@account-kit/core';
import { sepolia } from '@account-kit/infra';
import { alchemy } from '@account-kit/infra';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountKitService {
  private config: AlchemyAccountsConfig;
  private accountSignal = signal<GetAccountResult<'LightAccount'> | null>(null);

  constructor() {
    this.config = createConfig({
      chain: sepolia,
      transport: alchemy({ apiKey: environment.alchemyApiKey })
    });

    // Watch for account changes
    watchAccount('LightAccount', this.config)((account) => {
      this.accountSignal.set(account);
    });
  }

  get account() {
    return this.accountSignal.asReadonly();
  }

  getAccount() {
    return getAccount({ type: 'LightAccount' }, this.config);
  }

  getSigner() {
    return getSigner(this.config);
  }

  async authenticateWithEmail(email: string) {
    const signer = this.getSigner();
    if (!signer) {
      throw new Error('Signer not available');
    }

    try {
      const user = await signer.authenticate({
        type: 'email',
        email: email,
        emailMode: 'otp'
      });
      return user;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  async authenticateWithOtp(otpCode: string) {
    const signer = this.getSigner();
    if (!signer) {
      throw new Error('Signer not available');
    }

    try {
      const user = await signer.authenticate({
        type: 'otp',
        otpCode: otpCode
      });
      return user;
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  }

  async sendTransaction(to: string, value: string) {
    try {
      const { client } = getSmartAccountClient({ type: 'LightAccount' }, this.config);

      if (!client) {
        throw new Error('Smart account client not available');
      }

      const hash = await client.sendTransaction({
        to: to as `0x${string}`,
        value: BigInt(value),
        chain: sepolia
      });

      return hash;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  async getBalance() {
    try {
      const { client, address } = getSmartAccountClient({ type: 'LightAccount' }, this.config);

      if (!client || !address) {
        throw new Error('Smart account client not available');
      }

      const balance = await client.getBalance({ address });
      return balance;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }
}