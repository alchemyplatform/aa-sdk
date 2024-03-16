import type {
  Address,
  SmartAccountSigner,
  ToSmartContractAccountParams,
} from "@alchemy/aa-core";
import { hashDomain } from "./utils/hashDomain.js";
import { concat, hashMessage, hashTypedData } from "viem";
import { hashType, hashStruct } from "./utils/hashTypedData.js";

export interface GetErc1271SigningFunctionsParams {
  accountAddress: Address;
  accountName: string;
  accountVersion: string;
  chainId: number;
  signer: SmartAccountSigner;
  wrapperTypeName: string;
}

export const getErc1271SigningFunctions = ({
  accountAddress,
  accountName,
  accountVersion,
  chainId,
  signer,
  wrapperTypeName,
}: GetErc1271SigningFunctionsParams) => {
  const domain = {
    name: accountName,
    version: accountVersion,
    chainId,
    verifyingContract: accountAddress,
  };
  const personalSignParentTypehash = hashType({
    primaryType: wrapperTypeName,
    types: {
      [wrapperTypeName]: [{ name: "childHash", type: "bytes32" }],
    },
  });

  const signMessage: ToSmartContractAccountParams["signMessage"] = async ({
    message,
  }) => {
    const childHash = hashMessage(message);
    const rsv = await signer.signTypedData({
      domain,
      types: {
        [wrapperTypeName]: [{ name: "childHash", type: "bytes32" }],
      },
      primaryType: wrapperTypeName,
      message: { childHash },
    });
    return concat([rsv, personalSignParentTypehash]);
  };

  const signTypedData: ToSmartContractAccountParams["signTypedData"] = async (
    typedData
  ) => {
    const { domain: childDomain, message, primaryType, types } = typedData;
    if ((types as any)[wrapperTypeName]) {
      throw new Error(
        `Wrapper type name ${wrapperTypeName} already in use in requested typed data`
      );
    }
    if (!childDomain) {
      throw new Error("Domain missing");
    }
    const childDomainHash = hashDomain(childDomain);
    const contentsHash = hashStruct({
      data: message as any,
      primaryType: typedData.primaryType,
      types: types as any,
    });
    const childHash = hashTypedData(typedData);
    const typeInfo = {
      types: {
        [wrapperTypeName]: [
          { name: "childHash", type: "bytes32" },
          { name: "child", type: primaryType },
        ],
        ...types,
      },
      primaryType: wrapperTypeName,
    };
    const parentTypeHash = hashType(typeInfo as any);
    const rsv = await signer.signTypedData({
      domain,
      ...typeInfo,
      message: { childHash, child: message },
    });
    return concat([rsv, parentTypeHash, childDomainHash, contentsHash]);
  };

  return {
    signMessage,
    signTypedData,
  };
};
