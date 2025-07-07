// Example type definitions for the wallet client package

export interface WalletClientConfig {
  /** The RPC URL to connect to */
  rpcUrl: string;
  /** Optional chain ID */
  chainId?: number;
  /** Optional timeout for requests */
  timeout?: number;
}

export interface WalletClient {
  /** Get the current configuration */
  getConfig(): WalletClientConfig;
  /** Connect to the wallet */
  connect(): Promise<void>;
  /** Disconnect from the wallet */
  disconnect(): Promise<void>;
  /** Check if connected */
  isConnected(): boolean;
}
