import {
  EOAPostLoginContents,
  EOAPostLoginActions,
} from "./EOAPostLoginContents";

export function EOAPostLogin() {
  return (
    <div className="px-10 py-11 flex flex-col border-none lg:border-solid border border-border rounded-lg overflow-hidden overflow-y-auto scrollbar-none">
      <div className="max-w-[486px] w-full bg-bg-surface-default">
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
