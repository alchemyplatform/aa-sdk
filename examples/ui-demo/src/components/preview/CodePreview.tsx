import { cn } from "@/lib/utils";
import ExternalLink from "../shared/ExternalLink";

import { Roboto_Mono } from "next/font/google";
import { Config, useConfig } from "@/src/app/state";
import dedent from "dedent";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
});

export function CodePreview() {
  const { config } = useConfig()
  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <div className="font-semibold text-foreground text-xl">
          Export configuration
        </div>
        <div className="text-sm text-gray-600">
          To get started, simply paste the below code into your environment.
          You’ll need to add your Alchemy API key and Gas Policy ID too. Login
          to automatically inject the keys into the code below.{" "}
          <ExternalLink href="#" className="text-blue-600 font-semibold">
            Fully customize CSS here.
          </ExternalLink>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="font-semibold text-secondary">Style</div>
        <CodeBlock title="tailwind.config.ts" code={getTailwindCode(config)} />
      </div>
      <div className="flex flex-col gap-4">
        <div className="font-semibold text-secondary">Config</div>
        <CodeBlock title="src/app/config.ts" code={getConfigCode(config)} />
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
  }

  return (
    <div className="rounded-lg flex flex-col text-sm overflow-hidden">
      <div className="flex justify-between px-4 py-3 bg-gray-700 text-white font-medium">
        <div>{title}</div>
        <button onClick={onCopy} className="bg-white/10 rounded-lg h-7 w-7 flex justify-center items-center">
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <pre
        className={cn("px-4 py-6 bg-gray-800 text-white", robotoMono.className)}
      >
        {code}
      </pre>
    </div>
  );
}


function getTailwindCode(config: Config) {
  const { ui } = config
  return dedent`
  import { withAccountKitUi, createColorSet } from "@alchemy/aa-alchemy/tailwind";
  import type { Config } from "tailwindcss";

  // wrap your existing tailwind config with 'withAccountKitUi'
  // docs on setting up tailwind here: https://tailwindcss.com/docs/installation
  export default withAccountKitUi(<your tailwind config>, {
    // override account kit themes
    colors: {
      "btn-primary": createColorSet("${ui.primaryColor.light}", "${ui.primaryColor.dark}"),
      "fg-accent-brand": createColorSet("${ui.primaryColor.light}", "${ui.primaryColor.dark}"),
    },
  })`;
}

function getConfigCode(config: Config) {
  const sections = []

  if (config.auth.showEmail) {
    sections.push([{ type: "email" }])
  }

  if (config.auth.showExternalWallets) {
    sections.push([{ type: "injected" }])
  }

  sections.push([{ type: "passkey" }])

  return dedent`
  const config = createConfig({
    // required
    rpcUrl: "/api/rpc",
    chain: sepolia,
    ssr: true,
  });
  
  const uiConfig = {
    auth: {
      sections: ${JSON.stringify(sections)},
      addPasskeyOnSignup: ${config.auth.addPasskey},
    },
  };
`
}
