import { cn } from "@/lib/utils";
import ExternalLink from "../shared/ExternalLink";

import { Roboto_Mono } from "next/font/google";
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
});

export function CodePreview() {
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
        <CodeBlock title="tailwind.config.ts" code={styleCode} />
      </div>
      <div className="flex flex-col gap-4">
        <div className="font-semibold text-secondary">Config</div>
        <CodeBlock title="src/app/page.tsx" code={styleCode} />
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

const styleCode = `import { withAccountKitUi } from "@alchemy/aa-alchemy/tailwind";
import type { Config } from "tailwindcss";

const config: Config = <your tailwind config>;
export default withAccountKitUi(config);
`;
