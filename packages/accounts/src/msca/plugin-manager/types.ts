import type { Address, Hash } from "viem";

export type InjectedHooksInfo = {
  preExecHookFunctionId: number;
  isPostHookUsed: boolean;
  postExecHookFunctionId: number;
};

export type InjectedHook = {
  // The plugin that provides the hook
  providingPlugin: Address;
  // Either a plugin-defined execution function, or the native function executeFromPluginExternal
  selector: Hash;
  injectedHooksInfo: InjectedHooksInfo;
  hookApplyData: Hash;
};
