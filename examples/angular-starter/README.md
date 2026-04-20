# Smart Wallets Angular Starter

This is an Angular starter project for building applications with Smart Wallets (Account Abstraction). It uses the `@account-kit/core` package to provide a framework-agnostic integration with Smart Wallets.

## Features

- Angular 20 with standalone components
- Smart Wallets integration using @account-kit/core
- Email OTP authentication
- External wallet connections (MetaMask, Coinbase Wallet, WalletConnect, Injected wallets)
- Transaction sending capabilities
- Balance checking
- Reactive state management with signals
- TypeScript support

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   - Update `src/environments/environment.ts` with your Alchemy API key
   - Or create a `.env` file (optional)

4. Start the development server:
   ```bash
   ng serve
   ```

5. Open your browser to `http://localhost:4200`

## Configuration

### Environment Setup

1. **Get Alchemy API Key:**
   - Visit [Alchemy Dashboard](https://dashboard.alchemy.com/)
   - Create a new app
   - Select "Sepolia" network
   - Copy your API key

2. **Update Environment File:**
   ```typescript
   // src/environments/environment.ts
   export const environment = {
     alchemyApiKey: 'your_actual_alchemy_api_key_here',
     alchemyPolicyId: 'your_paymaster_policy_id_here' // optional
   };
   ```

3. **Optional: Gas Sponsorship Setup**
   - In Alchemy Dashboard, go to "Gas Manager"
   - Create a new policy
   - Set rules for sponsored transactions
   - Copy the Policy ID to your environment

### WalletConnect Setup (Optional)

For production use, get a WalletConnect Project ID:

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID
4. Update `wallet.service.ts`:
   ```typescript
   walletConnect({
     projectId: 'your_actual_project_id_here',
     showQrModal: true
   })
   ```

### Supported Networks

- **Sepolia Testnet** (default): For testing and development
- **Mainnet**: Production Ethereum network (requires real ETH)

To change networks, modify the `chains` array in `wallet.service.ts`.

## How to Use

### Quick Start

1. **Start the application:**
   ```bash
   npm start
   ```
   Open `http://localhost:4200` in your browser.

2. **Choose your authentication method:**
   - **Smart Wallets**: Email-based authentication (recommended for new users)
   - **External Wallets**: Connect existing MetaMask, Coinbase, or other wallets

### Authentication Options

#### Option 1: Smart Wallets (Email OTP) - Recommended for Beginners

Smart Wallets provide a seamless experience without requiring existing crypto wallets.

1. **Enter Email**: Type your email address in the "Sign in with Email" section
2. **Receive OTP**: Check your email for a 6-digit verification code
3. **Verify Code**: Enter the code to authenticate
4. **Start Using**: You're now ready to send transactions!

**Benefits:**
- No wallet installation required
- Gas fees can be sponsored
- Enhanced security features
- Works on any device

#### Option 2: External Wallets

Connect your existing crypto wallet for full control.

1. **Click "Connect Wallet"**: Choose from available wallet options:
   - **MetaMask**: Most popular Ethereum wallet
   - **Coinbase Wallet**: Coinbase's mobile wallet
   - **WalletConnect**: Connect via QR code (works with 100+ wallets)
   - **Injected**: Other browser extension wallets

2. **Approve Connection**: Follow your wallet's prompts to connect
3. **Switch Network**: Ensure you're on Sepolia testnet
4. **Start Transacting**: Send ETH to other addresses

**Requirements:**
- Compatible wallet installed
- Some Sepolia ETH for gas fees (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### Switching Between Authentication Methods

You can use either Smart Wallets or external wallets, but not both simultaneously. To switch:

1. If connected to Smart Wallets: Click "Disconnect" in the account section
2. If connected to external wallet: Click "Disconnect" in the wallet section
3. Choose your preferred authentication method

### Sending Transactions

Once authenticated, you can send ETH transactions:

1. **Recipient Address**: Enter the Ethereum address (0x...)
2. **Amount**: Enter amount in wei (1 ETH = 10^18 wei)
3. **Send**: Click "Send Transaction"
4. **Confirm**: Approve in your wallet if using external wallet

**Example Transaction:**
- To: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
- Amount: `1000000000000000` (0.001 ETH)

### Checking Balance

Your account balance is automatically displayed when connected. The balance shows wei (smallest ETH unit).

**Conversion:**
- 1 ETH = 1,000,000,000,000,000,000 wei (10^18)
- 0.001 ETH = 1,000,000,000,000,000 wei

### Troubleshooting

#### Common Issues

**"Transaction failed"**
- Check if you have enough ETH for gas fees
- Verify the recipient address is correct
- Ensure you're on Sepolia testnet

**"Invalid OTP code"**
- Codes expire after 10 minutes
- Check spam/junk folder
- Request a new code if expired

**"Wallet connection failed"**
- Ensure your wallet is unlocked
- Check if you're on the correct network (Sepolia)
- Try refreshing the page

**"Build errors"**
- Run `npm install` to ensure all dependencies are installed
- Check that your Node.js version is compatible (v18+ recommended)

#### Getting Test ETH

For external wallet testing, you'll need Sepolia ETH:

1. Go to [Sepolia Faucet](https://sepoliafaucet.com/)
2. Connect your wallet
3. Request test ETH (usually 0.5 ETH per request)

#### Network Configuration

The app uses Sepolia testnet. Ensure your wallet is configured for:
- **Network Name**: Sepolia
- **RPC URL**: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY` or any Sepolia RPC
- **Chain ID**: 11155111
- **Currency Symbol**: SepoliaETH

## Project Structure

- `src/app/account-kit.service.ts` - Smart Wallets service with auth & transaction methods
- `src/app/wallet.service.ts` - External wallet connection service using wagmi
- `src/app/wallet-connect/` - Wallet connection component and UI
- `src/app/home/` - Main component with authentication and transaction UI
- `src/environments/` - Environment configurations

## Development

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.2.

### Code Scaffolding

Run `ng generate component component-name` to generate a new component.

### Building

Run `ng build` to build the project.

### Testing

Run unit tests:
```bash
npm test
```

Run tests in headless mode (CI/CD):
```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Run tests with coverage:
```bash
npm test -- --code-coverage
```

**Test Coverage:**
- ✅ App Component: Basic rendering and title display
- ✅ Home Component: Authentication and transaction UI
- ✅ WalletConnect Component: Wallet connection interface
- ✅ WalletService: External wallet connection logic
- ✅ AccountKit Service: Smart wallet authentication

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/angular-starter/` directory.

### Running in Production

```bash
npm run build
npx serve dist/angular-starter
```

Or deploy to any static hosting service (Netlify, Vercel, etc.).

## API Reference

### AccountKitService

Smart Wallets authentication and transaction service.

```typescript
import { AccountKitService } from './account-kit.service';

// Inject the service
private accountKitService = inject(AccountKitService);

// Authentication
await accountKitService.authenticateWithEmail('user@example.com');
await accountKitService.authenticateWithOtp('123456');

// Transactions
await accountKitService.sendTransaction('0x...', '1000000000000000000'); // 1 ETH
const balance = await accountKitService.getBalance();

// Reactive state
const account = this.accountKitService.account; // Signal<Account | null>
```

**Methods:**
- `authenticateWithEmail(email: string): Promise<void>` - Send OTP to email
- `authenticateWithOtp(otpCode: string): Promise<void>` - Verify OTP code
- `sendTransaction(to: string, value: string): Promise<string>` - Send ETH transaction, returns tx hash
- `getBalance(): Promise<bigint>` - Get account balance in wei
- `account: Signal<Account | null>` - Reactive account state

### WalletService

External wallet connection service using wagmi.

```typescript
import { WalletService } from './wallet.service';

// Inject the service
private walletService = inject(WalletService);

// Connect wallets
await walletService.connectMetaMask();
await walletService.connectCoinbaseWallet();
await walletService.connectWalletConnect();
await walletService.connectInjected();

// Disconnect
await walletService.disconnectWallet();

// Reactive state
this.walletService.connection$.subscribe(connection => {
  if (connection) {
    console.log('Connected:', connection.address);
  }
});
```

**Methods:**
- `connectMetaMask(): Promise<void>` - Connect to MetaMask
- `connectCoinbaseWallet(): Promise<void>` - Connect to Coinbase Wallet
- `connectWalletConnect(): Promise<void>` - Connect via WalletConnect
- `connectInjected(): Promise<void>` - Connect to injected wallets
- `disconnectWallet(): Promise<void>` - Disconnect current wallet
- `connection$: Observable<WalletConnection | null>` - Wallet connection state

**Types:**
```typescript
interface WalletConnection {
  address: string;
  connector: string;
  chainId: number;
}
```

### Component Architecture

**App Component:**
- Main application shell
- Account status display
- Router outlet for navigation

**Home Component:**
- Authentication UI (Smart Wallets + External Wallets)
- Transaction sending interface
- Balance display

**WalletConnect Component:**
- Wallet selection buttons
- Connection status display
- Wallet-specific styling

## Contributing

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/angular-starter.git`
3. Install dependencies: `npm install`
4. Start development server: `npm start`
5. Run tests: `npm test`

### Code Style

This project uses:
- **Angular CLI** for code generation
- **TypeScript** with strict mode
- **SCSS** for styling
- **Jasmine/Karma** for testing

### Adding New Features

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Write tests for your feature
3. Implement the feature
4. Ensure all tests pass: `npm test -- --watch=false --browsers=ChromeHeadless`
5. Update documentation if needed
6. Submit a pull request

### Wallet Integration Guidelines

When adding new wallet connectors:

1. Add the connector to `WalletService`
2. Update the UI in `WalletConnectComponent`
3. Add appropriate styling
4. Write tests for the new functionality
5. Update this README

## Security Considerations

- Never commit API keys or sensitive data
- Use environment variables for configuration
- Validate all user inputs
- Implement proper error handling
- Keep dependencies updated

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://docs.alchemy.com/)
- 🐛 [Issues](https://github.com/alchemyplatform/aa-sdk/issues)
- 💬 [Discord](https://discord.gg/alchemyplatform)
- 📧 [Email Support](mailto:support@alchemy.com)

## Acknowledgments

- [Alchemy](https://alchemy.com/) for Account Abstraction infrastructure
- [Angular](https://angular.dev/) for the framework
- [Wagmi](https://wagmi.sh/) for wallet connectivity
- [Viem](https://viem.sh/) for Ethereum interactions
