import { useUiConfig } from "../../../../hooks/useUiConfig.js";
import { ls } from "../../../../strings.js";

export const HelpText = () => {
  const supportUrl = useUiConfig(({ supportUrl }) => supportUrl);

  if (!supportUrl) return null;
  return (
    <div className="flex flex-row gap-1 justify-center mb-2">
      <span className="text-fg-tertiary text-xs">
        {ls.loadingPasskey.supportText}
      </span>
      <a href={supportUrl} className="text-btn-primary text-xs underline">
        {ls.loadingPasskey.supportLink}
      </a>
    </div>
  );
};
