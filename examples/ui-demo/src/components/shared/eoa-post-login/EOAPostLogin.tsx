import {
  EOAPostLoginContents,
  EOAPostLoginActions,
} from "./EOAPostLoginContents";

export function EOAPostLogin() {
  return (
    <div className="flex flex-col">
      <div className="px-6 lg:px-10 py-11 max-w-[486px] w-full bg-bg-surface-default">
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
