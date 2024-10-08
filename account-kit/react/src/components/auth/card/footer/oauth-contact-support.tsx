import { useUiConfig } from "../../../../hooks/useUiConfig.js";

export const OAuthContactSupport = () => {
  const { supportUrl } = useUiConfig();
  return (
    supportUrl && (
      <div className="flex flex-row gap-1 justify-center mb-3">
        <span className="text-fg-tertiary text-xs">Having trouble?</span>
        <a
          className="text-btn-primary text-xs underline"
          href={supportUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          Contact Support
        </a>
      </div>
    )
  );
};
