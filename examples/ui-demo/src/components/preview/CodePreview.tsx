import { Config, DEFAULT_CONFIG, useConfig } from "@/app/state";
import dedent from "dedent";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark as syntaxTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import { twMerge } from "tailwind-merge";
import ExternalLink from "../shared/ExternalLink";

export function CodePreview({ className }: { className?: string }) {
  const { config } = useConfig();
  return (
    <div
      className={twMerge(
        "flex flex-col gap-6 p-6 overflow-y-auto scrollbar-none",
        className
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="font-semibold text-foreground text-xl">
          Export configuration
        </div>
        <div className="text-sm text-gray-600">
          To get started, simply paste the below code into your environment.
          You&apos;ll need to add your Alchemy API key and Gas Policy ID too.
          Log in to automatically inject the keys into the code below.{" "}
          <ExternalLink href="#" className="text-blue-600 font-semibold">
            Fully customize CSS here.
          </ExternalLink>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="mb-2 font-semibold text-secondary">Config</div>
        <p className="mb-4 text-sm text-secondary-foreground">
          Pass this config object into the{" "}
          <span className="font-mono">AlchemyAccountProvider</span>.
        </p>
        <CodeBlock title="src/app/config.ts" code={getConfigCode(config)} />
      </div>
      <div className="flex flex-col">
        <div className="mb-2 font-semibold text-secondary">Style</div>
        <p className="mb-4 text-sm text-secondary-foreground">
          Not using tailwind?{" "}
          <ExternalLink
            href="https://tailwindcss.com/docs/installation/using-postcss"
            className="text-blue-600 font-semibold"
          >
            Follow this guide to get started
          </ExternalLink>
          , then add the below code to your config file.
        </p>
        <CodeBlock title="tailwind.config.ts" code={getTailwindCode(config)} />
      </div>
    </div>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg flex flex-col text-sm overflow-hidden">
      <div className="flex justify-between px-4 py-3 bg-gray-700 text-white font-medium items-center">
        {title}
        <button
          onClick={onCopy}
          className="bg-white/10 rounded-lg h-7 w-7 flex justify-center items-center"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <SyntaxHighlighter
        showLineNumbers
        language="typescript"
        style={syntaxTheme}
        customStyle={{
          margin: 0,
          background: "#1F2937",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function getTailwindCode(config: Config) {
  const { ui } = config;
  return dedent`
  import { withAccountKitUi, createColorSet } from "@account-kit/react/tailwind";

  // wrap your existing tailwind config with 'withAccountKitUi'
  export default withAccountKitUi({
    // your tailwind config here
    // docs on setting up tailwind here: https://tailwindcss.com/docs/installation/using-postcss
  }, {
    // override account kit themes
    colors: {
      "btn-primary": createColorSet("${ui.primaryColor.light}", "${
    ui.primaryColor.dark
  }"),
      "fg-accent-brand": createColorSet("${ui.primaryColor.light}", "${
    ui.primaryColor.dark
  }"),
    },${
      ui.borderRadius !== DEFAULT_CONFIG.ui.borderRadius
        ? `
    borderRadius: "${ui.borderRadius}",`
        : ""
    }
  })`;
}

function getConfigCode(config: Config) {
  const sections = [];

  if (config.auth.showEmail) {
    sections.push([{ type: "email" }]);
  }

  if (config.auth.showPasskey) {
    sections.push([{ type: "passkey" }]);
  }

  if (config.auth.showExternalWallets && config.auth.showPasskey) {
    sections[1].push({ type: "injected" });
  } else if (config.auth.showExternalWallets) {
    sections.push([{ type: "injected" }]);
  }

  return dedent`
  import { AlchemyAccountsUIConfig, createConfig } from "@account-kit/react";
  import { sepolia } from "@account-kit/infra";
  import { QueryClient } from "@tanstack/react-query";

  const uiConfig: AlchemyAccountsUIConfig = {
    illustrationStyle: "${config.ui.illustrationStyle}",
    auth: {
      sections: ${JSON.stringify(sections)},
      addPasskeyOnSignup: ${
        config.auth.addPasskey && config.auth.showPasskey
      },${
    config.ui.logoLight || config.ui.logoDark
      ? '\n      header: <img src="path/to/logo.svg" />,'
      : ""
  }
    },
  };

  export const config = createConfig({
    // if you don't want to leak api keys, you can proxy to a backend and set the rpcUrl instead here
    // get this from the app config you create at https://dashboard.alchemy.com/accounts
    apiKey: "your-api-key",
    chain: sepolia,
    ssr: true, // set to false if you're not using server-side rendering
  }, uiConfig);

  export const queryClient = new QueryClient();
`;
}
