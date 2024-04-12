import { useExportAccount } from "@alchemy/aa-alchemy/react";

export function ComponentWithExportAccount() {
  // Assumes the app has context of a signer with an authenticated user
  const { exportAccount, isExported, isExporting, ExportAccountComponent } =
    useExportAccount({
      iframeContainerId: "turnkey-export-wallet-container-id",
      iframeElementId: "turnkey-export-wallet-element-id",
    });

  return (
    <div>
      {!isExported ? (
        <button onClick={() => exportAccount()} disabled={isExporting}>
          Export Account
        </button>
      ) : (
        <strong>Seed Phrase</strong>
      )}
      <ExportAccountComponent className="w-full" isExported={isExported} />
    </div>
  );
}
