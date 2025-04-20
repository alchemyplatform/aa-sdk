import {
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
  type TransactionConfirmationStrategy,
  type TransferParams,
} from "@solana/web3.js";
import type { BaseSignerClient } from "./client/base";
import { SolanaSigner } from "./solanaSigner";
import bs58 from "bs58";
import { z, ZodType } from "zod";

async function getConfirmationStrategy(
  connection: Connection,
  signature: string
): Promise<TransactionConfirmationStrategy> {
  const latestBlockHash = await connection.getLatestBlockhash();

  return {
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature,
  };
}

type GetState = <X>(isX: (x: unknown) => x is X) => Promise<X>;
//prettier-ignore
type HasParentData<Parent, Data, ReturnType = Data> = 
  Parent extends SolanaPipe<Data, any, any, any> ? ReturnType :
  Parent extends SolanaPipe<any, null, any, any> ? [["HasParentData: Could not find parent data"]] :
  Parent extends SolanaPipe<any, infer R, any, any> ? HasParentData<R, Data, ReturnType> :
  [["HasParentData: Could not figure out Parent data type"]];

function getParentData<P extends SolanaPipe, D>(
  testFn: (x: unknown) => x is D,
  pipe: P
): HasParentData<P, D> {
  const data = pipe.state;
  if (testFn(data)) return data as HasParentData<P, D>;
  if (pipe.parent === null)
    throw new Error("Could not find state with: " + testFn.name);
  return getParentData(testFn, pipe.parent) as HasParentData<P, D>;
}
function isSolanaSigner(x: unknown): x is SolanaSigner {
  return x instanceof SolanaSigner;
}
function isConnection(x: unknown): x is Connection {
  return x instanceof Connection;
}

export class SolanaPipe<
  State = any,
  Parent extends SolanaPipe<any, any, any, any> | null = any,
  In = void,
  Out = void
> {
  private constructor(
    readonly state: State,
    readonly parent: Parent,
    readonly fn: (input: In, getState: GetState) => Promise<Out>
  ) {
    this.fn = fn;
  }

  andThen<NewData, NewIn extends Out, NewOut>(
    data: NewData,
    fn: (input: NewIn, getState: GetState) => Promise<NewOut>
  ) {
    return new SolanaPipe<NewData, typeof this, In, NewOut>(
      data,
      this,
      async (x, getState) => fn((await this.fn(x, getState)) as NewIn, getState)
    );
  }
  beforeThen<NewData, NewIn, NewOut extends In>(
    data: NewData,
    fn: (input: NewIn, getState: GetState) => Promise<NewOut>
  ) {
    return new SolanaPipe<NewData, typeof this, NewIn, Out>(
      data,
      this,
      async (x, getState) => this.fn(await fn(x, getState), getState)
    );
  }

  static default = new SolanaPipe(null, null, async () => void 0);

  static fromAlchemyClient(client: BaseSignerClient) {
    return SolanaPipe.fromSolanaSigner(new SolanaSigner(client));
  }

  static fromSolanaSigner(client: SolanaSigner) {
    return new SolanaPipe(client, null, fromSolanaSigner);
  }

  withTransfer(
    this: SolanaPipe<any, any, any, Transaction | VersionedTransaction>,
    transfer: Omit<TransferParams, "fromPubkey">
  ) {
    return this.beforeThen(transfer, withTransfer);
  }
  withInstructions(
    this: SolanaPipe<any, any, any, Transaction | VersionedTransaction>,
    instructions: TransactionInstruction[]
  ) {
    return this.beforeThen(instructions, withInstructions);
  }

  withAlchemySponsorship(
    this: SolanaPipe<
      any,
      any,
      Transaction | VersionedTransaction,
      Transaction | VersionedTransaction
    >,
    policyId: string
  ) {
    return this.beforeThen({ policyId }, withAlchemySponsorship);
  }

  broadcast(
    this: SolanaPipe<any, any, void, Transaction | VersionedTransaction>,
    connection: Connection
  ) {
    return this.andThen(connection, broadcast).fn(void 0, this.getState());
  }

  private getState() {
    return async <X>(isX: (x: unknown) => x is X) => {
      return getParentData(isX, this);
    };
  }
}

async function broadcast(
  signedTransaction: Transaction | VersionedTransaction,
  getState: GetState
) {
  const connection = await getState(isConnection);
  const signature =
    "version" in signedTransaction
      ? signedTransaction.signatures[0]!
      : signedTransaction.signature!;

  const confirmationStrategy = await getConfirmationStrategy(
    connection,
    bs58.encode(signature)
  );
  const transactionHash = await sendAndConfirmRawTransaction(
    connection,
    Buffer.from(signedTransaction.serialize()),
    confirmationStrategy,
    { commitment: "confirmed" }
  );

  return transactionHash;
}

const isZod = <A>(zod: ZodType<A>, name: string) => {
  const fn = (x: unknown): x is A => {
    return zod.safeParse(x).success;
  };
  fn.name = name;
  return fn;
};
const isTransfer = isZod(
  z.object({
    lamports: z.number(),
    toPubkey: z.instanceof(PublicKey),
  }),
  "isTransfer"
);

const isInstructions = isZod(
  z.array(z.instanceof(TransactionInstruction)),
  "isInstructions"
);
async function withTransfer(_: void, getState: GetState) {
  const signer = await getState(isSolanaSigner);
  const connection = await getState(isConnection);
  const transfer = await getState(isTransfer);
  const instructions = [
    SystemProgram.transfer({
      ...transfer,
      fromPubkey: new PublicKey(signer.address),
    }),
  ];
  return signer.createTransfer(instructions, connection);
}

async function withInstructions(
  _: void,
  getState: GetState
): Promise<Transaction | VersionedTransaction> {
  const signer = await getState(isSolanaSigner);
  const connection = await getState(isConnection);
  const instructions = await getState(isInstructions);
  return signer.createTransfer(instructions, connection);
}

async function fromSolanaSigner(
  transaction: Transaction | VersionedTransaction,
  getState: GetState
): Promise<Transaction | VersionedTransaction> {
  const signer = await getState(isSolanaSigner);
  await signer.addSignature(transaction);
  return transaction;
}

const isPolicyId = isZod(z.object({ policyId: z.string() }), "isPolicyId");

async function withAlchemySponsorship(
  input: TransactionInstruction[],
  getState: GetState
): Promise<VersionedTransaction> {
  const { policyId } = await getState(isPolicyId);
  const signer = await getState(isSolanaSigner);
  const connection = await getState(isConnection);
  return signer.addSponsorship(input, connection, policyId);
}
