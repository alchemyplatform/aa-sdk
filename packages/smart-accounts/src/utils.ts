import type { Client } from "viem";
import { call } from "viem/actions";
import { getAction } from "viem/utils";
const RIP_7212_CHECK_BYTECODE =
  "0x60806040526040517f532eaabd9574880dbf76b9b8cc00832c20a6ec113d682299550d7a6e0f345e25815260056020820152600160408201527f4a03ef9f92eb268cafa601072489a56380fa0dc43171d7712813b3a19a1eb5e560608201527f3e213e28a608ce9a2f4a17fd830c6654018a79b3e0263d91a8ba90622df6f2f0608082015260208160a0836101005afa503d5f823e3d81f3fe";

export const chainHas7212 = async (client: Client): Promise<boolean> => {
  const callAction = getAction(client, call, "call");

  const { data } = await callAction({
    data: RIP_7212_CHECK_BYTECODE,
  });

  return data ? BigInt(data) === 1n : false;
};
