import {
  EOAPostLoginContents,
  EOAPostLoginActions,
} from "./EOAPostLoginContents";

export function EOAPostLogin() {
  return (
    <div className="border-border border radius-2 px-10 py-11 max-w-[486px] w-full bg-bg-surface-default">
      <EOAPostLoginContents />
      <EOAPostLoginActions />
    </div>
  );
}
