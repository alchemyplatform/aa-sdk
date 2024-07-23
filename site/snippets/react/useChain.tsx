import { useChain } from "@alchemy/aa-alchemy/react";
import { optimism } from "@alchemy/aa-core";

export function ComponentWithUseChain() {
  const { chain, setChain } = useChain();

  return (
    <div>
      <p>{chain.id}</p>
      <button onClick={() => setChain({ chain: optimism })}>
        Change Chain to Optimism
      </button>
    </div>
  );
}
