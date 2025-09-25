export type PaymentMethod =
  | "APPLE_PAY"
  | "GOOGLE_PAY"
  | "DEBIT_CARD"
  | "CREDIT_CARD"
  | "ACH"
  | "SAME_DAY_ACH"
  | "BANK_TRANSFER"
  | "SEPA"
  | "PAYPAL"
  | "SKRILL"
  | "NETELLER";

export type ProviderId =
  | "coinbase"
  | "kraken"
  | "transak"
  | "moonpay"
  | "banxa"
  | "ramp"
  | "wert"
  | "meld";

export type RankStrategy = "best_total_received" | "fastest" | "lowest_fee";

export type FundingErrorCode =
  | "UNSUPPORTED_COUNTRY"
  | "UNSUPPORTED_PAYMENT_METHOD"
  | "NO_ROUTE_AVAILABLE"
  | "QUOTE_EXPIRED"
  | "LOCK_UNAVAILABLE"
  | "VALIDATION_FAILED"
  | "PROVIDER_UNAVAILABLE"
  | "AMOUNT_OUT_OF_RANGE";

// API Request/Response types
export interface GetConfigParams {
  countryCode: string;
  userId?: string;
  locale?: string;
}

export interface GetConfigResponse {
  countryCode: string;
  defaults: {
    fiat: string;
    paymentMethod: PaymentMethod;
    token: string;
    recommendedProviderId?: ProviderId;
  };
  catalog: {
    fiats: Array<{
      code: string;
      name: string;
    }>;
    tokens: Array<{
      code: string;
      name: string;
      chain: string;
    }>;
    paymentMethods: Array<{
      type: PaymentMethod;
      label: string;
      recommended?: boolean;
    }>;
  };
  limits: Array<{
    fiat: string;
    paymentMethod: PaymentMethod;
    min: string;
    max: string;
    default: string;
    precision: number;
  }>;
  ui: {
    quoteLockSeconds: number;
  };
}

export interface GetQuotesParams {
  countryCode: string;
  source: {
    amount: string;
    currency: string;
  };
  destination: {
    token: string;
    chain: string;
    walletAddress: string;
  };
  paymentMethod: PaymentMethod;
  rankStrategy?: RankStrategy;
  providers?: ProviderId[];
  lock?: boolean;
  limit?: number;
}

export interface Quote {
  quoteId: string;
  providerId: ProviderId;
  badges?: string[];
  destinationAmount: string;
  exchangeRate: string;
  fees: {
    processing: string;
    network: string;
    total: string;
  };
  etaSeconds: number;
  paymentMethod: PaymentMethod;
  expiresAt: string;
}

export interface GetQuotesResponse {
  requestId: string;
  rankedBy?: RankStrategy;
  quotes: Quote[];
}

export interface CreateSessionParams {
  quoteId: string;
  idempotencyKey: string;
  returnUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateSessionResponse {
  sessionId: string;
  providerId: ProviderId;
  widgetUrl: string;
  expiresAt: string;
}

export interface RefreshQuoteParams {
  quoteId: string;
}

export interface RefreshQuoteResponse extends Quote {}

// JSON-RPC types
export interface JsonRpcRequest<T> {
  id: number;
  jsonrpc: "2.0";
  method: string;
  params: [T];
}

export interface JsonRpcResponse<T> {
  jsonrpc: "2.0";
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: {
      code: FundingErrorCode;
      context?: Record<string, unknown>;
      retryAfterSeconds?: number;
    };
  };
  id: number;
}
