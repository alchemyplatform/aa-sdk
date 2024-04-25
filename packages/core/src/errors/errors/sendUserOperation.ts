import { BaseError } from "viem"
import { type SendUserOperationParameters } from "../actions/bundler/sendUserOperation"
import type { EntryPoint } from "../types/entrypoint"
import { prettyPrint } from "./utils"

export type SendUserOperationErrorType<entryPoint extends EntryPoint> =
    SendUserOperationError<entryPoint> & {
        name: "SendUserOperationError"
    }
export class SendUserOperationError<
    entryPoint extends EntryPoint
> extends BaseError {
    override cause: BaseError

    override name = "SendUserOperationError"

    constructor(
        cause: BaseError,
        {
            userOperation,
            entryPoint,
            docsPath
        }: SendUserOperationParameters<entryPoint> & {
            docsPath?: string
        }
    ) {
        const prettyArgs = prettyPrint({
            ...userOperation,
            entryPoint
        })

        super(cause.shortMessage, {
            cause,
            docsPath,
            metaMessages: [
                ...(cause.metaMessages ? [...cause.metaMessages, " "] : []),
                "sendUserOperation Arguments:",
                prettyArgs
            ].filter(Boolean) as string[]
        })
        this.cause = cause
    }
}
