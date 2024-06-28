import { useBundlerClient } from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";

export function ComponentWithBundlerClient() {
  const client = useBundlerClient();

  const { data, isLoading } = useQuery({
    queryKey: ["supportedEntryPoints"],
    queryFn: () => client.getSupportedEntryPoints(),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{JSON.stringify(data)}</h1>
    </div>
  );
}
