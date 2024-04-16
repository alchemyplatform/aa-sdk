// Copied from https://github.com/wevm/viem/blob/viem%402.9.12/src/utils/signature/hashTypedData.ts.
// Unfortunately, viem does not export `hashDomain`, `hashStruct`, or `hashType`.

// Implementation forked and adapted from https://github.com/MetaMask/eth-sig-util/blob/main/src/sign-typed-data.ts

import type { AbiParameter, TypedData, TypedDataDomain } from "abitype";
import {
  type TypedDataDefinition,
  type Hex,
  type GetTypesForEIP712DomainErrorType,
  type ValidateTypedDataErrorType,
  getTypesForEIP712Domain,
  validateTypedData,
  keccak256,
  concat,
  type Keccak256ErrorType,
  type EncodeAbiParametersErrorType,
  encodeAbiParameters,
  type ToHexErrorType,
  toHex,
} from "viem";

type ErrorType<name extends string = "Error"> = Error & { name: name };

type MessageTypeProperty = {
  name: string;
  type: string;
};

export type HashTypedDataParameters<
  typedData extends TypedData | Record<string, unknown> = TypedData,
  primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
> = TypedDataDefinition<typedData, primaryType>;

export type HashTypedDataReturnType = Hex;

export type HashTypedDataErrorType =
  | GetTypesForEIP712DomainErrorType
  | HashDomainErrorType
  | HashStructErrorType
  | ValidateTypedDataErrorType
  | ErrorType;

export function hashTypedData<
  const typedData extends TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | "EIP712Domain"
>(
  parameters: HashTypedDataParameters<typedData, primaryType>
): HashTypedDataReturnType {
  const {
    domain = {},
    message,
    // eslint-disable-next-line @typescript-eslint/no-redeclare
    primaryType,
  } = parameters as HashTypedDataParameters;
  const types = {
    EIP712Domain: getTypesForEIP712Domain({ domain }),
    ...parameters.types,
  };

  // Need to do a runtime validation check on addresses, byte ranges, integer ranges, etc
  // as we can't statically check this with TypeScript.
  validateTypedData({
    domain,
    message,
    primaryType,
    types,
  });

  const parts: Hex[] = ["0x1901"];
  if (domain)
    parts.push(
      hashDomain({
        domain,
        types: types as Record<string, MessageTypeProperty[]>,
      })
    );

  if (primaryType !== "EIP712Domain")
    parts.push(
      hashStruct({
        data: message,
        primaryType,
        types: types as Record<string, MessageTypeProperty[]>,
      })
    );

  return keccak256(concat(parts));
}

export type HashDomainErrorType = HashStructErrorType | ErrorType;

export function hashDomain({
  domain,
  types,
}: {
  domain: TypedDataDomain;
  types: Record<string, MessageTypeProperty[]>;
}) {
  return hashStruct({
    data: domain,
    primaryType: "EIP712Domain",
    types,
  });
}

type HashStructErrorType = EncodeDataErrorType | Keccak256ErrorType | ErrorType;

export function hashStruct({
  data,
  primaryType,
  types,
}: {
  data: Record<string, unknown>;
  primaryType: string;
  types: Record<string, MessageTypeProperty[]>;
}) {
  const encoded = encodeData({
    data,
    primaryType,
    types,
  });
  return keccak256(encoded);
}

type EncodeDataErrorType =
  | EncodeAbiParametersErrorType
  | EncodeFieldErrorType
  | HashTypeErrorType
  | ErrorType;

function encodeData({
  data,
  primaryType,
  types,
}: {
  data: Record<string, unknown>;
  primaryType: string;
  types: Record<string, MessageTypeProperty[]>;
}) {
  const encodedTypes: AbiParameter[] = [{ type: "bytes32" }];
  const encodedValues: unknown[] = [hashType({ primaryType, types })];

  for (const field of types[primaryType]) {
    const [type, value] = encodeField({
      types,
      name: field.name,
      type: field.type,
      value: data[field.name],
    });
    encodedTypes.push(type);
    encodedValues.push(value);
  }

  return encodeAbiParameters(encodedTypes, encodedValues);
}

type HashTypeErrorType =
  | ToHexErrorType
  | EncodeTypeErrorType
  | Keccak256ErrorType
  | ErrorType;

export function hashType({
  primaryType,
  types,
}: {
  primaryType: string;
  types: Record<string, MessageTypeProperty[]>;
}) {
  const encodedHashType = toHex(encodeType({ primaryType, types }));
  return keccak256(encodedHashType);
}

type EncodeTypeErrorType = FindTypeDependenciesErrorType;

function encodeType({
  primaryType,
  types,
}: {
  primaryType: string;
  types: Record<string, MessageTypeProperty[]>;
}) {
  let result = "";
  const unsortedDeps = findTypeDependencies({ primaryType, types });
  unsortedDeps.delete(primaryType);

  const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
  for (const type of deps) {
    result += `${type}(${types[type]
      .map(({ name, type: t }) => `${t} ${name}`)
      .join(",")})`;
  }

  return result;
}

type FindTypeDependenciesErrorType = ErrorType;

function findTypeDependencies(
  {
    primaryType: primaryType_,
    types,
  }: {
    primaryType: string;
    types: Record<string, MessageTypeProperty[]>;
  },
  results: Set<string> = new Set()
): Set<string> {
  const match = primaryType_.match(/^\w*/u);
  const primaryType = match?.[0]!;
  if (results.has(primaryType) || types[primaryType] === undefined) {
    return results;
  }

  results.add(primaryType);

  for (const field of types[primaryType]) {
    findTypeDependencies({ primaryType: field.type, types }, results);
  }
  return results;
}

type EncodeFieldErrorType =
  | Keccak256ErrorType
  | EncodeAbiParametersErrorType
  | ToHexErrorType
  | ErrorType;

function encodeField({
  types,
  name,
  type,
  value,
}: {
  types: Record<string, MessageTypeProperty[]>;
  name: string;
  type: string;
  value: any;
}): [type: AbiParameter, value: any] {
  if (types[type] !== undefined) {
    return [
      { type: "bytes32" },
      keccak256(encodeData({ data: value, primaryType: type, types })),
    ];
  }

  if (type === "bytes") {
    const prepend = value.length % 2 ? "0" : "";
    value = `0x${prepend + value.slice(2)}`;
    return [{ type: "bytes32" }, keccak256(value)];
  }

  if (type === "string") return [{ type: "bytes32" }, keccak256(toHex(value))];

  if (type.lastIndexOf("]") === type.length - 1) {
    const parsedType = type.slice(0, type.lastIndexOf("["));
    const typeValuePairs = (value as [AbiParameter, any][]).map((item) =>
      encodeField({
        name,
        type: parsedType,
        types,
        value: item,
      })
    );
    return [
      { type: "bytes32" },
      keccak256(
        encodeAbiParameters(
          typeValuePairs.map(([t]) => t),
          typeValuePairs.map(([, v]) => v)
        )
      ),
    ];
  }

  return [{ type }, value];
}
