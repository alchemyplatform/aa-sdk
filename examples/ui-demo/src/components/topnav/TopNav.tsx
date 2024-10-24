import ExternalLink from "../shared/ExternalLink";
import { GithubLogo } from "../icons/github";
import { Wordmark } from "../icons/wordmark";
import { links } from "@/utils/links";

export function TopNav() {
  return (
    <div className="fixed xl:sticky left-0 top-0 right-0 flex justify-center py-5 bg-demo-bg xl:bg-demo-nav-bg shadow-sm z-10">
      <div className="flex items-center justify-between h-full w-full max-w-[1440px] mx-6 md:mx-7 lg:mx-10">
        <div className="flex justify-center items-center gap-2">
          {/* This link is used to refresh the page when the user clicks the logo */}
          <a href="/">
            <Wordmark />
          </a>
          <div className="w-px h-5 bg-gray-500" />
          <p className="text-lg align-middle whitespace-nowrap">Account Kit</p>
        </div>

        <div className="flex gap-1 md:gap-8 items-center h-8">
          <ExternalLink
            href={links.quickstartGuide}
            className="hidden md:flex p-2 font-semibold hover:bg-gray-100 transition-colors rounded-lg"
          >
            Quickstart
          </ExternalLink>
          <ExternalLink href={links.github}>
            <GithubLogo className="hidden md:flex" />
          </ExternalLink>
          <ExternalLink href={links.dashboard}>
            <button className="h-10 hidden md:flex justify-center items-center py-[12px] text-sm font-semibold px-3 bg-demo-fg-primary text-demo-bg radius-[8px] text-nowrap">
              Get API key
            </button>
          </ExternalLink>
          <div className="flex md:hidden">
            <ExternalLink
              className="btn px-3 py-2.5 border border-btn-secondary"
              href="https://accountkit.alchemy.com/react/quickstart"
            >
              Docs
            </ExternalLink>
          </div>
        </div>
      </div>
    </div>
  );
}
