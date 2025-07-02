import React, { ReactNode } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/dom";
import { test, expect, afterEach } from "vitest";
import {
  useSmartAccountClient,
  cookieStorage,
  createConfig,
  AlchemyAccountProvider,
} from "@account-kit/react";
import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = createConfig(
  {
    transport: alchemy({ apiKey: "api-key" }),
    chain: arbitrumSepolia,
    ssr: true,
    storage: cookieStorage,
    enablePopupOauth: true,
    policyId: "policy-id",
  },
  {},
);

const queryClient = new QueryClient();

afterEach(() => {
  cleanup();
});

test("instantiates the client", async () => {
  const TestProvider = (props: { children: ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <AlchemyAccountProvider
          config={config}
          queryClient={queryClient}
          initialState={undefined}
        >
          {props.children}
        </AlchemyAccountProvider>
      </QueryClientProvider>
    );
  };
  const TestComponent = () => {
    const client = useSmartAccountClient({});
    return <p data-testid="client-address">{client.address}</p>;
  };

  render(
    <TestProvider>
      <TestComponent />
    </TestProvider>,
  );

  await waitFor(() => {
    const addressElement = screen.getByTestId("client-address");

    expect(addressElement).toBeDefined();

    // TODO(jh): we need to actually wait for the client to load first.
    expect(addressElement.textContent).toMatch(/^0x[a-fA-F0-9]{40}$/); // Checks for Ethereum address format
  });
});
