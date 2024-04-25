import { BaseError } from "viem"

export type VerificationGasLimitTooLowErrorType =
    VerificationGasLimitTooLowError & {
        name: "VerificationGasLimitTooLowError"
    }
export class VerificationGasLimitTooLowError extends BaseError {
    static message = /aa4[01]/
    override name = "VerificationGasLimitTooLowError"
    constructor({
        cause,
        verificationGasLimit,
        docsPath
    }: {
        cause?: BaseError
        verificationGasLimit?: bigint
        docsPath?: string
    }) {
        super(
            [
                `The smart account and paymaster verification exceeded the verificationGasLimit ${verificationGasLimit} set for the user operation.`,
                "",
                "Possible solutions:",
                "• Verify that the verificationGasLimit set for the user operation is high enough to cover the gas used during smart account and paymaster verification.",
                "• If you are using the eth_estimateUserOperationGas or pm_sponsorUserOperation method from bundler provider to set user operation gas limits and the EntryPoint throws this error during submission, reach out to them.",
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}

export type ActualGasCostTooHighErrorType = ActualGasCostTooHighError & {
    name: "ActualGasCostTooHighError"
}
export class ActualGasCostTooHighError extends BaseError {
    static message = /aa51/
    override name = "ActualGasCostTooHighError"
    constructor({
        cause,
        docsPath
    }: {
        cause?: BaseError
        docsPath?: string
    }) {
        super(
            [
                "The actual gas cost of the user operation ended up being higher than the funds paid by the smart account or the paymaster.",
                "",
                "Possible solutions:",
                "• If you encounter this error, try increasing the verificationGasLimit set for the user operation.",
                "• If you are using the eth_estimateUserOperationGas or pm_sponsorUserOperation method from bundler provider to set user operation gas limits and the EntryPoint throws this error during submission, reach out to them.",
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}

export type GasValuesOverflowErrorType = GasValuesOverflowError & {
    name: "GasValuesOverflowError"
}
export class GasValuesOverflowError extends BaseError {
    static message = /aa94/
    override name = "GasValuesOverflowError"
    constructor({
        cause,
        docsPath
    }: {
        cause?: BaseError
        docsPath?: string
    }) {
        super(
            [
                "The gas limit values of the user operation overflowed, they must fit in uint160.",
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}

export type BundlerOutOfGasErrorType = BundlerOutOfGasError & {
    name: "BundlerOutOfGasError"
}
export class BundlerOutOfGasError extends BaseError {
    static message = /aa95/
    override name = "BundlerOutOfGasError"
    constructor({
        cause,
        docsPath
    }: {
        cause?: BaseError
        docsPath?: string
    }) {
        super(
            [
                "The bundler tried to bundle the user operation with the gas limit set too low.",
                "",
                "Possible solutions:",
                "• If you are using your own bundler, configure it send gas limits properly.",
                "• If you are using a bundler provider, reach out to them.",
                "",
                docsPath ? `Docs: ${docsPath}` : ""
            ].join("\n"),
            {
                cause
            }
        )
    }
}
