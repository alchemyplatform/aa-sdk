import { useUiConfig } from "../../../../hooks/useUiConfig.js";
import { ls } from "../../../../strings.js";

export const OAuthContactSupport = () => {
  const { supportUrl } = useUiConfig(({ supportUrl }) => ({ supportUrl }));
  return (
    supportUrl && (
      <div className="flex flex-row gap-1 justify-center mb-3">
        <span className="text-fg-tertiary text-xs">
          {ls.oauthContactSupport.title}
        </span>
        <a
          className="text-btn-primary text-xs underline"
          href={supportUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          {ls.oauthContactSupport.body}
        </a>
      </div>
    )
  );
};
