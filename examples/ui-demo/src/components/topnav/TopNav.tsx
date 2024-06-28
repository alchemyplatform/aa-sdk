import Link from "next/link";
import ExternalLink from "../shared/ExternalLink";
import { links } from "@/src/utils/links";
import { GithubLogo } from "../icons/github";
import { ArrowUpRightIcon } from "../icons/arrow";
import Image from "next/image";

export function TopNav() {
  return (
    <div className="left-0 top-0 right-0 py-5 bg-white shadow-sm">
      <div className="flex items-center justify-between h-full w-full max-w-screen-2xl mx-auto px-10">
          <Image
            width={250}
            height={80}
            src="/images/account-kit-logo.png"
            alt="Account Kit by Alchemy"
            style={{ objectFit: 'contain', height: 'auto' }}
          />
        <div className="flex gap-4 items-center h-8">
          <div className="flex items-center gap-6 font-semibold">
            <Link className="p-2 bg-gray-100 rounded-lg" href="#">
              Demo
            </Link>
            <ExternalLink href={links.docs} className="p-2 hover:bg-gray-100 transition-colors rounded-lg">
              Docs
            </ExternalLink>
            <ExternalLink href={links.docs} className="p-2 hover:bg-gray-100 transition-colors rounded-lg flex items-center gap-1 mr-4">
              Examples
              <ArrowUpRightIcon className="h-4 w-4" />
            </ExternalLink>
          </div>
          <BarSeparator />
          <ExternalLink href={links.github}><GithubLogo /></ExternalLink>
        </div>
      </div>
    </div>
  );
}

function BarSeparator() {
  return <div className="self-stretch border-r border-gray-200" />;
}
