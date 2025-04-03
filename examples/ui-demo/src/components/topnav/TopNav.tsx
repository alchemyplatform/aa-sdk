import { Metrics } from "@/metrics";
import { links } from "@/utils/links";
import { useCallback } from "react";
import { GithubLogo } from "../icons/github";
import { Wordmark } from "../icons/wordmark";
import ExternalLink from "../shared/ExternalLink";
import Image from "next/image";

export function TopNav() {
  const onDashboardClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    Metrics.trackEvent({ name: "get_api_key_clicked" });
    window.open(
      `${links.dashboard}&utm_id=${Metrics._internal.anonId}`,
      "_blank"
    );
  }, []);

  return (
    <div className="fixed lg:sticky left-0 top-0 right-0 flex justify-center py-5 bg-demo-bg lg:bg-demo-nav-bg shadow-sm z-20">
      <div className="flex items-center justify-between h-full w-full max-w-[1440px] mx-6 md:mx-7 lg:mx-10">
        <div className="flex justify-center items-center gap-4">
          {/* This link is used to refresh the page when the user clicks the logo */}
          <a href="/">
            <Wordmark />
          </a>
          <div className="hidden sm:block w-px h-6 bg-gray-500" />
          <Image
            src="/images/smart-wallets.svg"
            width={200}
            height={26}
            alt="smart wallets"
            className="hidden sm:block"
          />
        </div>
        <div className="flex gap-1 md:gap-8 items-center h-8">
          <ExternalLink
            href={links.quickstartGuide}
            onClick={() => Metrics.trackEvent({ name: "quickstart_clicked" })}
            className="hidden md:flex p-2 font-semibold hover:bg-gray-100 transition-colors rounded-lg"
          >
            Quickstart
          </ExternalLink>
          <ExternalLink
            href={links.github}
            onClick={() => Metrics.trackEvent({ name: "github_clicked" })}
            aria-label="GitHub"
          >
            <GithubLogo className="hidden md:flex" />
          </ExternalLink>
          <ExternalLink onClick={onDashboardClick} href={""}>
            <button className="h-10 hidden md:flex justify-center items-center py-[12px] text-sm font-semibold px-3 bg-demo-fg-primary text-demo-bg radius-[8px] text-nowrap">
              Get API key
            </button>
          </ExternalLink>
          <div className="flex md:hidden">
            <ExternalLink
              className="akui-btn px-3 py-2.5 border border-btn-secondary"
              href={links.quickstartGuide}
              onClick={() => Metrics.trackEvent({ name: "quickstart_clicked" })}
            >
              Docs
            </ExternalLink>
          </div>
        </div>
      </div>
    </div>
  );
}
