import { cn } from "@/lib/utils";
import { RenderUserConnectionAvatar } from "../user-connection-avatar/RenderUserConnectionAvatar";
import { useUser } from "@account-kit/react";
import ExternalLink from "@/components/shared/ExternalLink";
import { Metrics } from "@/metrics";
import { CodePreviewSwitch } from "@/components/shared/CodePreviewSwitch";

export function PreviewNav({
  showCode,
  setShowCode,
}: {
  showCode: boolean;
  setShowCode: (showCode: boolean) => void;
}) {
  const user = useUser();
  return (
    <div
      className={cn(
        `w-full p-6 top-0 left-0 border-border z-10 relative lg:sticky lg:after:hidden after:content-[''] after:absolute after:bottom-0 after:left-6 after:right-6 after:h-[1px] after:bg-border`,
        !user && !showCode && "hidden lg:block lg:absolute",
        (user || showCode) && "lg:border-b"
      )}
    >
      <div
        className={cn(
          "flex justify-between items-start",
          !showCode && !user && "justify-end"
        )}
      >
        {!showCode && user && <RenderUserConnectionAvatar />}
        {showCode && (
          <div className="font-semibold text-foreground text-xl">
            Export configuration
          </div>
        )}

        <CodePreviewSwitch checked={showCode} onCheckedChange={setShowCode} />
      </div>
      {showCode && (
        <p className="text-sm text-demo-fg-secondary max-w-[85%]">
          To get started, simply paste the below code into your environment.
          You&apos;ll need to add your Alchemy API key and Gas Policy ID.{" "}
          <ExternalLink
            onClick={() =>
              Metrics.trackEvent({
                name: "codepreview_theme_customization_clicked",
              })
            }
            href="https://accountkit.alchemy.com/react/customization/theme"
            className="font-semibold text-blue-600"
          >
            Fully customize styling here.
          </ExternalLink>
        </p>
      )}
    </div>
  );
}
