import {
  EOAPostLoginContents,
  EOAPostLoginActions,
} from "./EOAPostLoginContents";

export function EOAPostLogin() {
  return (
    <div className="flex-1 h-full flex flex-col">
      <div className="border-border border radius-2 px-6 lg:px-10 py-11 max-w-[486px] w-full bg-bg-surface-default">
        <EOAPostLoginContents />
        <div className="hidden lg:block">
          <EOAPostLoginActions />
        </div>
      </div>
      <div className="block lg:hidden mt-auto">
        <EOAPostLoginActions />
      </div>
    </div>
  );
}
