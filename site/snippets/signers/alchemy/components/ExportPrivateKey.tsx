import { useMutation } from "@tanstack/react-query";
import { signer } from "../signer.js";

const TurnkeyExportWalletContainerId = "turnkey-export-wallet-container-id";
const TurnkeyExportWalletElementId = "turnkey-export-wallet-element-id";

// This allows us to style the embedded iframe
const iframeCss = `
iframe {
    box-sizing: border-box;
    width: 100%;
    height: 120px;
    border-radius: 8px;
    border-width: 1px;
    border-style: solid;
    border-color: rgba(216, 219, 227, 1);
    padding: 20px;
}
`;

export const ExportPrivateKeyView = () => {
  // we are using react-query to handle loading states more easily, but feel free to use w/e state management library you prefer
  const {
    mutate: exportWallet,
    isLoading,
    data,
  } = useMutation({
    mutationFn: () =>
      signer.exportWallet({
        iframeContainerId: TurnkeyExportWalletContainerId,
        iframeElementId: TurnkeyExportWalletElementId,
      }),
  });

  // Once the user clicks the button, a request will be sent to initialize private key export
  // once the request is complete, the iframe will be rendered with either
  // 1. the private key if the user is logged in with a passkey
  // 2. the seed phrase if the user is logged in with email
  return (
    <div className="flex flex-col gap-2">
      {!data ? (
        <button onClick={() => exportWallet()} disabled={isLoading}>
          Export Wallet
        </button>
      ) : (
        <strong>Seed Phrase</strong>
      )}
      <div
        className="w-full"
        style={{ display: !data ? "none" : "block" }}
        id={TurnkeyExportWalletContainerId}
      >
        <style>{iframeCss}</style>
      </div>
    </div>
  );
};
