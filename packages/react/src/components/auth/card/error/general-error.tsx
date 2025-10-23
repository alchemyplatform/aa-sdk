import { Warning } from "../../../../icons/warning.js";
import { ls } from "../../../../strings.js";

export const GeneralError = () => {
  return (
    <div className="bg-bg-surface-critical flex rounded-lg p-2 gap-2">
      <Warning />
      <div>
        <h2 className="text-fg-critical text-xs font-medium">
          {ls.error.general.title}
        </h2>
        <p className="text-fg-critical text-xs">{ls.error.general.body}</p>
      </div>
    </div>
  );
};
