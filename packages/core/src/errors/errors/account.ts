import { type Address, BaseError } from "viem"

export type SenderAlreadyDeployedErrorType = SenderAlreadyDeployedError & {
    name: "SenderAlreadyDeployedError"
}
export class SenderAlreadyDeployedError extends BaseError {
    static message = /aa10/
    override name = "SenderAlreadyDeployedError" as const
    constructor({
        cause,
        sender,
        docsPath
    }: { cause?: BaseError; sender?: Address; docsPath?: string } = {}) {
        super(
            [
                `Smart account ${sender} is already deployed.`,
                "",
                "Possible solutions:",
                `• Remove the initCode from the user operation and set it to "0x"`,
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}

export type InitCodeRevertedErrorType = InitCodeRevertedError & {
    name: "InitCodeRevertedError"
}
export class InitCodeRevertedError extends BaseError {
    static message = /aa13/
    override name = "InitCodeRevertedError" as const
    constructor({
        cause,
        docsPath
    }: { cause?: BaseError; docsPath?: string } = {}) {
        super(
            [
                "EntryPoint failed to create the smart account with the initCode provided.",
                "",
                "Possible reasons:",
                "• The initCode ran out of gas",
                "• The initCode reverted during the account deployment process",
                "",
                "Possible solutions:",
                "• Verify that the factory address in the initCode is correct (the factory address is the first 20 bytes of the initCode).",
                "• Verify that the initCode is correct.",
                "• Check whether the verificationGasLimit is sufficient for the initCode to complete without running out of gas.",
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}

export type SenderAddressMismatchErrorType = SenderAddressMismatchError & {
    name: "SenderAddressMismatchError"
}
export class SenderAddressMismatchError extends BaseError {
    static message = /aa14/
    override name = "SenderAddressMismatchError" as const
    constructor({
        cause,
        sender,
        docsPath
    }: {
        cause?: BaseError
        sender: Address
        docsPath?: string
    }) {
        super(
            [
                "The initCode returned a different smart account address than expected.",
                `Expected: ${sender}`,
                "",
                "Possible reasons:",
                "• Account deployed with the initCode provided does not match match the sender address provided",
                "",
                "Possible solutions:",
                "• Verify that the sender address was generated deterministically from the initCode. (consider leveraging functions like getSenderAddress)",
                "• Verify that the factory address in the initCode is correct (the factory address is the first 20 bytes of the initCode)",
                "• Verify that the initCode is correct.",
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}

export type InitCodeDidNotDeploySenderErrorType =
    InitCodeDidNotDeploySenderError & {
        name: "InitCodeDidNotDeploySenderError"
    }
export class InitCodeDidNotDeploySenderError extends BaseError {
    static message = /aa15/
    override name = "InitCodeDidNotDeploySenderError" as const
    constructor({
        cause,
        sender,
        docsPath
    }: {
        cause?: BaseError
        sender: Address
        docsPath?: string
    }) {
        super(
            [
                `The initCode did not deploy the sender at the address ${sender}.`,
                "",
                "Possible reasons:",
                "• The initCode factory is not creating an account.",
                "• The initCode factory is creating an account, but is not implemented correctly as it is not deploying at the sender address",
                "",
                "Possible solutions:",
                "• Verify that the factory address in the initCode is correct (the factory address is the first 20 bytes of the initCode).",
                "• Verify that the initCode factory is implemented correctly. The factory must deploy the smart account at the sender address.",
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}

export type SenderNotDeployedErrorType = SenderNotDeployedError & {
    name: "SenderNotDeployedError"
}
export class SenderNotDeployedError extends BaseError {
    static message = /aa20/
    override name = "SenderNotDeployedError" as const
    constructor({
        cause,
        sender,
        docsPath
    }: {
        cause?: BaseError
        sender: Address
        docsPath?: string
    }) {
        super(
            [
                `Smart account ${sender} is not deployed.`,
                "",
                "Possible reasons:",
                "• An initCode was not specified, but the sender address (i.e. the smart account) is not deployed.",
                "",
                "Possible solutions:",
                "• If this is the first transaction by this account, make sure the initCode is included in the user operation.",
                "• If the smart account is already supposed to be deployed, verify that you have selected the correct sender address for the user operation.",
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}

export type SmartAccountInsufficientFundsErrorType =
    SmartAccountInsufficientFundsError & {
        name: "SmartAccountInsufficientFundsError"
    }
export class SmartAccountInsufficientFundsError extends BaseError {
    static message = /aa21/
    override name = "SmartAccountInsufficientFundsError" as const
    constructor({
        cause,
        sender,
        docsPath
    }: {
        cause?: BaseError
        sender: Address
        docsPath?: string
    }) {
        super(
            [
                `You are not using a paymaster, and the ${sender} address did not have enough native tokens to cover the gas costs associated with the user operation.`,
                "",
                "Possible solutions:",
                "• If you are not using a paymaster, verify that the sender address has enough native tokens to cover the required prefund. Consider leveraging functions like getRequiredPrefund.",
                "• If you are looking to use a paymaster to cover the gas fees, verify that the paymasterAndData field is set.",
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}

export type SmartAccountSignatureValidityPeriodErrorType =
    SmartAccountSignatureValidityPeriodError & {
        name: "SmartAccountSignatureValidityPeriodError"
    }
export class SmartAccountSignatureValidityPeriodError extends BaseError {
    static message = /aa22/
    override name = "SmartAccountSignatureValidityPeriodError" as const
    constructor({
        cause,
        docsPath
    }: {
        cause?: BaseError
        docsPath?: string
    }) {
        super(
            [
                "The signature used in the user operation is not valid, because it is outside of the time range it specified.",
                "",
                "Possible reasons:",
                "• This error occurs when the block.timestamp falls after the validUntil timestamp, or before the validAfter timestamp.",
                "",
                "Possible solutions:",
                "• If you are looking to use time-based signatures, verify that the validAfter and validUntil fields are set correctly and that the user operation is sent within the specified range.",
                "• If you are not looking to use time-based signatures, verify that the validAfter and validUntil fields are set to 0.",
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}

export type SmartAccountValidationRevertedErrorType =
    SmartAccountValidationRevertedError & {
        name: "SmartAccountValidationRevertedError"
    }
export class SmartAccountValidationRevertedError extends BaseError {
    static message = /aa23/
    override name = "SmartAccountValidationRevertedError" as const
    constructor({
        cause,
        sender,
        docsPath
    }: {
        cause?: BaseError
        sender: Address
        docsPath?: string
    }) {
        super(
            [
                `The smart account ${sender} reverted or ran out of gas during the validation of the user operation.`,
                "",
                "Possible solutions:",
                "• Verify that the verificationGasLimit is high enough to cover the validateUserOp function's gas costs.",
                "• Make sure validateUserOp returns uint(1) for invalid signatures, and MUST NOT REVERT when the signature is invalid",
                "• If you are not using a paymaster, verify that the sender address has enough native tokens to cover the required pre fund. Consider leveraging functions like getRequiredPrefund.",
                "• Verify that the validateUserOp function is implemented with the correct logic, and that the user operation is supposed to be valid.",
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}

export type InvalidSmartAccountSignatureErrorType =
    InvalidSmartAccountSignatureError & {
        name: "InvalidSmartAccountSignatureError"
    }
export class InvalidSmartAccountSignatureError extends BaseError {
    static message = /aa24/
    override name = "InvalidSmartAccountSignatureError" as const
    constructor({
        cause,
        sender,
        docsPath
    }: {
        cause?: BaseError
        sender: Address
        docsPath?: string
    }) {
        super(
            [
                `The smart account ${sender} signature is invalid.`,
                "",
                "Possible solutions:",
                "• Verify that the user operation was correctly signed, and that the signature was correctly encoded in the signature field of the user operation.",
                "• Most smart account implementations sign over the userOpHash. Make sure that the userOpHash is correctly computed. Consider leveraging functions like getUserOperationHash.",
                "• Make sure you have selected the correct chainId and entryPointAddress when computing the userOpHash.",
                "• Make sure the smart account signature verification function is correctly implemented.",
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}

export type InvalidSmartAccountNonceErrorType =
    InvalidSmartAccountNonceError & {
        name: "InvalidSmartAccountNonceError"
    }
export class InvalidSmartAccountNonceError extends BaseError {
    static message = /aa25/
    override name = "InvalidSmartAccountNonceError" as const
    constructor({
        cause,
        sender,
        nonce,
        docsPath
    }: {
        cause?: BaseError
        sender: Address
        docsPath?: string
        nonce: bigint
    }) {
        const nonceKey = nonce >> BigInt(64) // first 192 bits of nonce
        const nonceSequence = nonce & 0xffffffffffffffffn // last 64 bits of nonce

        super(
            [
                `The smart account ${sender} nonce is invalid.`,
                `Nonce sent: ${nonce} (key: ${nonceKey}, sequence: ${nonceSequence})`,
                "",
                "Possible solutions:",
                "• Verify that you are using the correct nonce for the user operation. The nonce should be the current nonce of the smart account for the selected key. Consider leveraging functions like getAccountNonce.",
                "• Verify that the nonce is formatted correctly.",
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}
