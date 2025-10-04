import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccountKitService } from './account-kit.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private accountKitService = inject(AccountKitService);

  protected readonly title = 'Smart Wallets Angular Starter';

  protected account = this.accountKitService.account;

  protected accountStatus = computed(() => {
    const acc = this.account();
    if (!acc) return 'Not connected';
    if (acc.status === 'READY' && acc.account) {
      return `Connected: ${(acc.account as any)?.address || 'Unknown'}`;
    }
    return `Status: ${acc.status}`;
  });
}
