import type { SmartAccountSigner } from "@alchemy/aa-core";
import { concatHex, type Hex } from "viem";

export enum ValidatorMode {
  sudo = "0x00000000",
  plugin = "0x00000001",

  //To be enabled later
  // enable = '0x00000002',
}

export interface KernelBaseValidatorParams {
  validatorAddress: Hex;
  mode: ValidatorMode;
  owner: SmartAccountSigner;
}

//Kernel wallet implementation separates out validation and execution phase. It allows you to have
// custom wrapper logic for the validation phase in addition to signature of choice. We start with base validator class
// which implements only signing but can be extended to other methods later
export class KernelBaseValidator {
  readonly validatorAddress: Hex;
  mode: ValidatorMode;
  owner: SmartAccountSigner;

  constructor(params: KernelBaseValidatorParams) {
    this.validatorAddress = params.validatorAddress;
    this.mode = params.mode;
    this.owner = params.owner;
  }

  getAddress(): Hex {
    return this.validatorAddress;
  }

  async getOwnerAddress(): Promise<Hex> {
    return this.owner.getAddress();
  }
  async signMessageWithValidatorParams(
    userOpHash: Uint8Array | string | Hex
  ): Promise<Hex> {
    if (
      this.mode === ValidatorMode.sudo ||
      this.mode === ValidatorMode.plugin
    ) {
      try {
        const signature = await this.owner.signMessage(userOpHash);
        return concatHex([this.mode, signature]);
      } catch (err: any) {
        console.log("Got Error - ", err.message);
        throw new Error("Validator failed to sign message");
      }
    } else {
      throw new Error("Validator mode not supported");
    }
  }
}
