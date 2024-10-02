import ExternalLink from "../shared/ExternalLink";
import { GithubLogo } from "../icons/github";
import { Wordmark } from "../icons/wordmark";
import { links } from "@/utils/links";

export function TopNav() {
  return (
    <div className="sticky left-0 top-0 right-0 py-5 bg-white shadow-sm">
      <div className="flex items-center justify-between h-full w-full max-w-screen-2xl mx-auto px-4 md:px-10">
        <div className="flex items-center gap-2">
          <Wordmark />
          <div className="w-px h-5 bg-gray-500" />
          <p>Account kit</p>
        </div>

        <div className="flex gap-4 items-center h-8">
          <div className="hidden md:flex items-center gap-8 font-semibold">
            <ExternalLink
              href={links.quickstartGuide}
              className="p-2 hover:bg-gray-100 transition-colors rounded-lg mr-4"
            >
              Quickstart
            </ExternalLink>
            <ExternalLink
              href={links.integrationCall}
              className="p-2 hover:bg-gray-100 transition-colors rounded-lg"
            >
              Integration call
            </ExternalLink>
            <ExternalLink href={links.github}>
              <GithubLogo />
            </ExternalLink>
          </div>
          <div className="flex md:hidden">
            <a
              className="btn px-3 py-2.5 border border-btn-secondary text-sm"
              href="https://accountkit.alchemy.com/react/quickstart"
              target="_blank"
            >
              Build
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
