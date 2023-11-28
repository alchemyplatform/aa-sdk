---
outline: deep
# https://vitepress.dev/reference/default-theme-home-page
layout: home
# HTML Metadata
head:
  - - meta
    - property: og:title
      content: Account Kit Documentation
  - - meta
    - name: description
      content: Account Kit is a vertically integrated stack for building apps that support ERC-4337 smart accounts, Signer integrations, sponsoring gas, bundlers, and an SDK.
  - - meta
    - property: og:description
      content: Account Kit is a vertically integrated stack for building apps that support ERC-4337 smart accounts, Signer integrations, sponsoring gas, bundlers, and an SDK.
  - - meta
    - name: twitter:title
      content: Account Kit Documentation
  - - meta
    - name: twitter:description
      content: Account Kit is a vertically integrated stack for building apps that support ERC-4337 smart accounts, Signer integrations, sponsoring gas, bundlers, and an SDK.
titleTemplate: :title Documentation
# you can also add HTML or Markdown components below the --- line to add custom HTML or Markdown content (eg: https://github.com/wagmi-dev/viem/blob/main/site/index.md?plain=1)
---

<div class="flex flex-col h-screen">
  <div class="flex flex-grow justify-center bg-hero-light dark:bg-hero-dark bg-cover pb-[48px]">
    <div class="flex grow max-w-[var(--vp-layout-max-width)] w-[100%] px-[32px]">
      <div class="flex flex-col flex-auto min-w-[100%]">
        <div
          class="flex flex-col py-[96px] max-xl:py-[40px]"
        >
          <div
            class="flex flex-row justify-between items-center self-stretch md:max-xl:flex-col md:max-xl:gap-[40px]"
          >
            <div
              class="w-[579px] flex flex-col gap-[32px] justify-between max-lg:items-center"
            >
              <div
                class="flex flex-row items-center justify-start gap-[16px] font-bold text-[24px]"
              >
                <img src="/kit-logo.svg" alt="Account Kit Logo" />
                <span>Account Kit</span>
              </div>
              <div
                class="gap-[28px] text-[64px] font-bold items-end color max-md:text-center max-md:text-[56px] leading-none"
              >
                <div class="flex flex-col max-lg:items-center">
                  <text class="bg-gradient-1 bg-clip-text transparent-text-fill max-lg:flex max-lg:flex-wrap">Account Kit</text> 
                  <text class="max-sm:hidden">Documentation</text>
                  <text class="hidden max-sm:block">Docs</text>
                </div>
              </div>
              <div class="text-[22px] font-normal max-md:text-center">
                Account Kit is a vertically integrated stack for building apps that support ERC-4337: smart accounts, Signer integrations, sponsoring gas, bundlers, and an SDK.
              </div>
              <div class="flex flex-row gap-[8px] justify-start items-center">
                <a rel="noopener noreferrer" href="./overview/getting-started.html">
                  <button
                    class="flex items-center rounded-md px-[12px] py-[12px] text-[16px] font-semibold text-white transition duration-300 ease-in-out hover:scale-105 hover:opacity-90 bg-black dark:bg-white dark:text-black"
                  >
                    Explore the docs
                  </button>
                </a>
                <a rel="noopener noreferrer" href="./overview/why-account-kit.html">
                  <button
                    class="flex items-center rounded-md px-[12px] py-[12px] text-[16px] font-semibold transition duration-300 ease-in-out hover:scale-105 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    Why Account Kit?
                  </button>
                </a>
              </div>
            </div>

<!-- needs to be formatted differently to work in markdown -->
<div class="vp-doc max-lg:hidden">

::: code-group

```typescript [getStarted.ts]
const provider = new AlchemyProvider(providerConfig).connect(
  (rpcClient) =>
    new LightSmartContractAccount({
      ...accountConfig,
      rpcClient,
    })
);

const { hash } = await provider.sendUserOperation(uo);
```

:::

</div>
          </div>
        </div>
        <div class="flex max-lg:flex-wrap justify-center gap-[32px]">
          <a rel="noopener noreferrer" href="./overview/introduction.html" class="flex-auto basis-1/3 max-lg:max-w-[370px] max-lg:min-w-[370px]">
            <div
              class="flex flex-col flex-auto p-[24px] gap-[24px] rounded-md text-white overflow-auto bg-gradient-3 group hover:scale-105 hover:opacity-90 transition duration-300 ease-in-out"
            >
              <div class="flex flex-col gap-[8px] items-start">
                <div class="text-[24px] font-semibold">Overview</div>
              </div>
              <div
                class="flex h-[24px] justify-end items-baseline self-stretch transition duration-300 ease-in-out group-hover:translate-x-[5px]"
              >
                <img src="/arrow-right.svg" alt="Click Here" />
              </div>
            </div>
          </a>
          <a rel="noopener noreferrer" href="./overview/getting-started.html" class="flex-auto basis-1/3 max-lg:max-w-[370px] max-lg:min-w-[370px]">
            <div
              class="flex flex-col flex-auto p-[24px] gap-[24px] rounded-md text-white overflow-auto bg-gradient-4 group hover:scale-105 hover:opacity-90 transition duration-300 ease-in-out"
            >
              <div class="flex flex-col gap-[8px] items-start">
                <div class="text-[24px] font-semibold">Getting Started</div>
              </div>
              <div
                class="flex h-[24px] justify-end items-baseline self-stretch transition duration-300 ease-in-out group-hover:translate-x-[5px]"
              >
                <img src="/arrow-right.svg" alt="Click Here" />
              </div>
            </div>
          </a>
          <a rel="noopener noreferrer" target="_blank" href="https://aa-simple-dapp.vercel.app/" class="flex-auto basis-1/3 max-lg:max-w-[370px] max-lg:min-w-[370px]">
            <div
              class="flex flex-col flex-auto p-[24px] gap-[24px] rounded-md text-white overflow-auto bg-gradient-2 group hover:scale-105 hover:opacity-90 transition duration-300 ease-in-out"
            >
              <div class="flex flex-col gap-[8px] items-start">
                <div class="text-[24px] font-semibold">Try it out!</div>
              </div>
              <div
                class="flex h-[24px] justify-end items-baseline self-stretch transition duration-300 ease-in-out group-hover:translate-x-[5px]"
              >
                <img src="/arrow-right.svg" alt="Click Here" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
  <footer
    class="flex flex-col gap-[32px] px-[215px] py-[56px] bg-black max-md:px-[40px] max-md:py-[40px]"
  >
    <div
      class="flex items-start gap-[8px] justify-between text-white max-md:items-center"
    >
      <div class="flex flex-col gap-[16px]">
        <img src="/alchemy.svg" alt="Alchemy Logo" class="max-lg:h-[40px] max-lg:w-[auto]"/>
        <text class="max-md:text-center">The web3 development platform</text>
      </div>
      <div class="flex flex-row gap-[16px] items-center max-sm:flex-col">
        <a target="_blank" href="https://www.facebook.com/alchemyplatform/">
          <img
            class="hover:scale-110 transition duration-300 ease-in-out"
            src="/fb.svg"
            alt="Facebook Logo"
          />
        </a>
        <a target="_blank" href="https://www.linkedin.com/company/alchemyinc/">
          <img
            class="hover:scale-110 transition duration-300 ease-in-out"
            src="/linkedin.svg"
            alt="LinkedIn Logo"
          />
        </a>
        <a target="_blank" href="https://twitter.com/AlchemyPlatform/">
          <img
            class="hover:scale-110 transition duration-300 ease-in-out"
            src="/twitter.svg"
            alt="Twitter Logo"
          />
        </a>
      </div>
    </div>
    <div class="w-full h-px gap-[32px] bg-white bg-opacity-30"></div>
    <div
      class="flex justify-end items-center gap-[32px] text-white max-md:justify-center"
    >
      <text>2023 Alchemy Insights, Inc.</text>
      <a target="_blank" href="https://www.alchemy.com">
        <button
          class="h-[38px] flex justify-center items-center gap-[8px] text-black px-[10px] py-[14px] rounded-md bg-white font-bold max-md:hidden hover:scale-105 transition duration-300 ease-in-out"
        >
          Powered by Alchemy
        </button>
      </a>
    </div>
  </footer>
</div>
