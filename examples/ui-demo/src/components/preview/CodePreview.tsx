import { Config, DEFAULT_CONFIG } from "@/app/config";
import { getSectionsForConfig } from "@/app/sections";
import { Metrics } from "@/metrics";
import { useConfigStore } from "@/state";
import { links } from "@/utils/links";
import dedent from "dedent";
import { Check, Copy } from "lucide-react";
import * as parserTypeScript from "prettier/parser-typescript";
import * as prettierPluginEstree from "prettier/plugins/estree";
import * as prettier from "prettier/standalone";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark as syntaxTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import { twMerge } from "tailwind-merge";
import ExternalLink from "../shared/ExternalLink";

export function CodePreview({ className }: { className?: string }) {
  const config = useConfigStore((state) => state);

  useEffect(() => {
    Metrics.trackEvent({ name: "codepreview_viewed" });
  }, []);

  return (
    <div
      className={twMerge(
        "flex flex-col gap-6 p-6 overflow-y-auto scrollbar-none",
        className
      )}
    >
      <div className="flex flex-col">
        <div className="mb-2 font-semibold text-secondary">Config</div>
        <p className="mb-4 text-sm text-secondary-foreground">
          Pass this config object into the{" "}
          <span className="font-mono">AlchemyAccountProvider</span>.
        </p>
        <CodeBlock
          title="src/app/config.ts"
          code={getConfigCode(config)}
          eventName="codepreview_config_copied"
        />
      </div>
      <div className="flex flex-col">
        <div className="mb-2 font-semibold text-secondary">Style</div>
        <p className="mb-4 text-sm text-secondary-foreground">
          Not using tailwind?{" "}
          <ExternalLink
            href="https://tailwindcss.com/docs/installation/using-postcss"
            onClick={() =>
              Metrics.trackEvent({ name: "codepreview_tailwind_setup_clicked" })
            }
            className="text-blue-600 font-semibold"
          >
            Follow this guide to get started
          </ExternalLink>
          , then add the below code to your config file.
        </p>
        <CodeBlock
          title="tailwind.config.ts"
          code={getTailwindCode(config.ui)}
          eventName="codepreview_style_copied"
        />
      </div>
    </div>
  );
}

function CodeBlock({
  title,
  code,
  eventName,
}: {
  title: string;
  code: string;
  eventName: "codepreview_config_copied" | "codepreview_style_copied";
}) {
  const [copied, setCopied] = useState(false);
  const [formattedCode, setFormattedCode] = useState(code);

  useEffect(() => {
    prettier
      .format(code, {
        parser: "typescript",
        plugins: [parserTypeScript, prettierPluginEstree],
      })
      .then(setFormattedCode);
  }, [code]);

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Metrics.trackEvent({ name: eventName });
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
        {formattedCode}
      </SyntaxHighlighter>
    </div>
  );
}

function getTailwindCode(ui: Config["ui"]) {
  return dedent`
  import { withAccountKitUi, createColorSet } from "@account-kit/react/tailwind";

  // wrap your existing tailwind config with 'withAccountKitUi'
  export default withAccountKitUi({
    // your tailwind config here
    // if using tailwind v4, this can be left empty since most options are configured via css
    // if using tailwind v3, add your existing tailwind config here - https://v3.tailwindcss.com/docs/installation/using-postcss
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
  const sections = getSectionsForConfig(config, "your-project-id");
  const socialIsEnabled = Object.values(config.auth.oAuthMethods).some(
    (enabled) => enabled
  );

  const code = dedent`
  import { AlchemyAccountsUIConfig, createConfig } from "@account-kit/react";
  import { sepolia, alchemy } from "@account-kit/infra";
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
    },${config.supportUrl ? `\n    supportUrl: "${config.supportUrl}"` : ""}
  };

  export const config = createConfig({
    // if you don't want to leak api keys, you can proxy to a backend and set the rpcUrl instead here
    // get this from the app config you create at ${links.dashboard}
    transport: alchemy({ apiKey: "your-api-key" }),
    chain: sepolia,
    ssr: true, // set to false if you're not using server-side rendering${
      socialIsEnabled ? "\n  enablePopupOauth: true," : ""
    }
  }, uiConfig);

  export const queryClient = new QueryClient();
`;

  return code;
}
