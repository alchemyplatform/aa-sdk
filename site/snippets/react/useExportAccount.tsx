import { useExportAccount } from "@alchemy/aa-alchemy/react";

export function ComponentWithExportAccount() {
  /**
   * Assumes the app has context of a signer with an authenticated user
   * by using the `AlchemyAccountProvider` from `@alchemy/aa-alchemy/react`.
   */
  const { exportAccount, isExported, isExporting, ExportAccountComponent } =
    useExportAccount();

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
