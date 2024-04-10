import { AlchemyAccountProvider } from "@alchemy/aa-alchemy/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./config";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider config={config} queryClient={queryClient}>
        {/** ... */}
      </AlchemyAccountProvider>
    </QueryClientProvider>
  );
}
