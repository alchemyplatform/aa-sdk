import Link from "next/link";
import { AlchemyFullLogo, AlchemyLogo } from "../icons/alchemy";
import ExternalLink from "../shared/ExternalLink";
import { DOCS } from "@/src/utils/links";
import { GithubLogo } from "../icons/github";

export function TopNav() {
  return (
    <div className="bg-white flex justify-between items-center px-10 py-5">
      <AlchemyFullLogo />
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-6 font-semibold">
          <Link className="p-2 bg-gray-100 rounded-lg" href="#">
            Demo
          </Link>
          <ExternalLink href={DOCS} className="p-2 hover:bg-gray-100 rounded">
            Docs
          </ExternalLink>
          <ExternalLink href={DOCS} className="p-2 hover:bg-gray-100 rounded">
            Examples
          </ExternalLink>
        </div>
        <BarSeparator />
        <GithubLogo />
      </div>
    </div>
  );
}

function BarSeparator() {
  return <div className="self-stretch border-r border-gray-200" />;
}
