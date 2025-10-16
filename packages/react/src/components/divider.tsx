import { ls } from "../strings.js";

export const Divider = () => {
  return (
    <div className={`flex flex-row gap-3 w-full items-center text-fg-tertiary`}>
      <div className={`h-[1px] bg-static basis-full shrink grow`} />
      <p>{ls.login.or}</p>
      <div className={`h-[1px] bg-static basis-full shrink grow`} />
    </div>
  );
};
