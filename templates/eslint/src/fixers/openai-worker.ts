import OpenAI from "openai";
import { runAsWorker } from "synckit";

const openai = new OpenAI();

const systemPrompt = `
Given sample code, you generate jsdocs for that code. You only return the jsdoc comment.
The jsdoc must include a description.
If the function takes in parameters it must include @param tags for each parameter.
The @param tags should include the type and a description of the parameter.
If the function returns something other than void then it should include a @returnstag which includes a description of the return type.
The jsdoc should also contain an @example tag above the @param tags with a placeholder: TODO: IMPLEMENT ME.

If the passed in code is a class, the jsdoc should ONLY include the class description
`;

const sampleUserPrompt = `
export function hydrate(
    config: AlchemyAccountsConfig,
    initialState?: StoredState
  ) {
    const initialAlchemyState =
      initialState != null && "alchemy" in initialState
        ? initialState.alchemy
        : initialState;
  
    if (initialAlchemyState && !config.clientStore.persist.hasHydrated()) {
      const { accountConfigs, signerStatus, ...rest } = initialAlchemyState;
      const shouldReconnectAccounts =
        signerStatus.isConnected || signerStatus.isAuthenticating;
  
      config.clientStore.setState({
        ...rest,
        accountConfigs,
        signerStatus: convertSignerStatusToState(
          AlchemySignerStatus.INITIALIZING
        ),
        accounts: hydrateAccountState(
          accountConfigs,
          shouldReconnectAccounts,
          config
        ),
      });
    }
  
    const initialWagmiState =
      initialState != null && "wagmi" in initialState
        ? initialState.wagmi
        : undefined;
    const { onMount: wagmi_onMount } = wagmi_hydrate(
      config._internal.wagmiConfig,
      {
        initialState: initialWagmiState,
        reconnectOnMount: true,
      }
    );
  
    return {
      async onMount() {
        if (config._internal.ssr) {
          await config.clientStore.persist.rehydrate();
          await config.coreStore.persist.rehydrate();
        }
  
        await wagmi_onMount();
  
        await reconnect(config);
      },
    };
  }
`;

const sampleResponse = `
/**
 * Will hydrate the client store with the provided initial state if one is provided.
 * 
 * @example TODO: IMPLEMENT ME
 * 
 * @param {AlchemyAccountsConfig} config the config containing the client store
 * @param {StoredState} initialState optional param detailing the initial ClientState
 * @returns {{onMount: () => Promise<void>}} an object containing an onMount function that can be called when your component first renders on the client
 */
`;

const samplePromptTwo = `
export async function createSimpleSmartAccount({
    chain,
    entryPoint = getEntryPoint(chain),
    factoryAddress = getDefaultSimpleAccountFactoryAddress(
      chain,
      entryPoint.version
    ),
    ...params
  }: CreateSimpleAccountParams): Promise<SimpleSmartAccount> {
    if (!params.signer) throw new AccountRequiresOwnerError("SimpleAccount");
    const simpleAccount = new SimpleSmartContractAccount(
      SimpleSmartAccountParamsSchema().parse({
        chain,
        entryPointAddress: entryPoint.address,
        factoryAddress,
        ...params,
      })
    );
  
    const parsedParams = SimpleSmartAccountParamsSchema().parse({
      chain,
      entryPointAddress: entryPoint.address,
      entryPointVersion: entryPoint.version,
      factoryAddress,
      ...params,
    });
  
    const base = await toSmartContractAccount({
      source: "SimpleAccount",
      transport: params.transport,
      chain,
      encodeBatchExecute: simpleAccount.encodeBatchExecute.bind(simpleAccount),
      encodeExecute: (tx) =>
        simpleAccount.encodeExecute.bind(simpleAccount)(
          tx.target,
          tx.value ?? 0n,
          tx.data
        ),
      entryPoint,
      getAccountInitCode: async () => {
        if (parsedParams.initCode) return parsedParams.initCode as Hex;
        return simpleAccount.getAccountInitCode();
      },
      getDummySignature: simpleAccount.getDummySignature.bind(simpleAccount),
      signMessage: ({ message }) =>
        simpleAccount.signMessage(
          typeof message === "string" ? message : message.raw
        ),
      // @ts-expect-error these types still represent the same thing, but they are just a little off in there definitions
      signTypedData: simpleAccount.signTypedData.bind(simpleAccount),
      accountAddress: parsedParams.accountAddress,
    });
  
    return {
      ...base,
      getSigner: () => simpleAccount.getSigner(),
    };
  }
`;

const sampleResponseTwo = `
/**
 * Creates a simple smart account using the provided parameters, including chain, entry point, factory address, and additional parameters. This function also ensures that a signer is provided.
 *
 * @param {CreateSimpleAccountParams} config The parameters for creating a simple smart account
 * @returns {Promise<SimpleSmartAccount>} A promise that resolves to a \`SimpleSmartAccount\` object containing the created account information and methods
 */
`;

const samplePromptThree = `
export const watchUser =
  (config: AlchemyAccountsConfig) => (onChange: (user?: User) => void) => {
    return config.clientStore.subscribe(({ user }) => user, onChange, {
      equalityFn: (a, b) => a?.userId === b?.userId,
    });
  };
`;

const sampleResponseThree = `
/**
 * Watches for changes to the user in the client store and triggers the provided callback when a change is detected.
 * 
 * @example TODO: Implement me
 * 
 * @param {AlchemyAccountsConfig} config the configuration containing the client store
 * @returns {(onChange: (user: User) => void) => (() => void)} a function to unsubscribe from the user updates
 */
`;

runAsWorker(async (codeToComment: string): Promise<string | null> => {
  const completion = await openai.chat.completions
    .create({
      // 2 shot approach to "train" the model. We should consider training the model on a larger dataset so we can refine it further.
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: sampleUserPrompt },
        { role: "assistant", content: sampleResponse },
        { role: "user", content: samplePromptTwo },
        { role: "assistant", content: sampleResponseTwo },
        { role: "user", content: samplePromptThree },
        { role: "assistant", content: sampleResponseThree },
        { role: "user", content: codeToComment },
      ],
      model: "gpt-4o",
      stream: false,
    })
    .catch((error) => {
      console.log(error);
      throw error;
    });

  return completion.choices[0].message.content;
});
