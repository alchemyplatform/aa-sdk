import { AlchemySigner } from "@alchemy/aa-alchemy";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export const LoginComponent = () => {
  // Assumes that you are using Next.js but you can use any other router library
  const params = useSearchParams();
  const router = useRouter();

  // It is recommended you wrap this in React Context or other state management
  // For this example, we are defining the Alchemy Signer in the component
  const signer = useMemo(
    () =>
      new AlchemySigner({
        client: {
          connection: {
            jwt: "alcht_<KEY>",
          },
          iframeConfig: {
            iframeContainerId: "turnkey-iframe-container",
          },
        },
      }),
    []
  );

  // we are using react-query to handle loading states more easily,
  // feel free to use whichever state management library you prefer
  const authUser = useCallback(async () => {
    if (params.get("bundle") != null) {
      await signer!.authenticate({
        type: "email",
        bundle: params.get("bundle")!,
      });

      router.push("/");
    }

    const user = await signer!.getAuthDetails().catch(() => {
      return undefined;
    });

    return user;
  }, [params, signer, router]);

  const {
    mutate: login,
    isLoading,
    data: user,
  } = useMutation({
    mutationFn: authUser,
  });

  return (
    <div>
      {user == null || isLoading ? (
        <button onClick={() => login()}>Log in</button>
      ) : (
        <div>
          <div>Address: {user.address}</div>
          <div>Email: {user.email}</div>
        </div>
      )}
      <div id="turnkey-iframe-container" />
    </div>
  );
};
