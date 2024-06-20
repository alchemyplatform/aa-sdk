import { cn } from "@/lib/utils";
import ExternalLink from "../shared/ExternalLink";

import { Roboto_Mono } from "next/font/google";
import { Config, DEFAULT_CONFIG, useConfig } from "@/src/app/state";
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
  return (
    <div className="rounded-lg flex flex-col text-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-700 text-white font-medium">
        {title}
      </div>
      <pre
        className={cn("px-4 py-6 bg-gray-800 text-white", robotoMono.className)}
      >
        {code}
      </pre>
    </div>
  );
}

function borderRadiusToRem(borderRadius: Config['ui']['borderRadius']) {
  switch (borderRadius) {
    case "none":
      return "0";
    case "sm":
      return "8px";
    case "md":
      return "12px";
    case "lg":
      return "16px";
  }
}

function getTailwindCode(config: Config) {
  const { ui } = config
  // TODO: separate primaryColor for light and dark mode
  return `import { withAccountKitUi, createColorSet } from "@alchemy/aa-alchemy/tailwind";
import type { Config } from "tailwindcss";

export default withAccountKitUi(<your tailwind config>, {
   // override account kit themes
   colors: {
     "btn-primary": createColorSet("${ui.primaryColor}", "${ui.primaryColor}"),
     "fg-accent-brand": createColorSet("${ui.primaryColor}", "${ui.primaryColor}"),
   },${ui.borderRadius !== DEFAULT_CONFIG.ui.borderRadius ? `
   borderRadius: {
     modal: "${borderRadiusToRem(ui.borderRadius)}",
   }` : ""}
 })
`
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

  return `const uiConfig = {
  auth: {
    sections: ${JSON.stringify(sections)},
    addPasskeyOnSignup: ${config.auth.addPasskey},
  },
};
  `
}
