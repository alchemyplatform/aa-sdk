import { LoadingIcon } from "../icons/loading";
import Image from "next/image";

export function Card({
  image,
  imageAlt,
  heading,
  content,
  buttons,
}: {
  image?: string;
  imageAlt: string;
  heading: string;
  content: React.ReactNode;
  buttons: React.ReactNode;
}) {
  return (
    <div className="bg-bg-surface-default rounded-lg p-4 w-full xl:p-6 xl:w-[326px] xl:h-[500px] flex flex-col shadow-smallCard mb-5 xl:mb-0 min-h-[220px]">
      <div className="flex xl:flex-col gap-4">
        <div className="flex-shrink-0 sm:mb-3 xl:mb-0 rounded-lg overflow-hidden relative flex items-center justify-center h-[67px] w-[60px] sm:h-[154px] sm:w-[140px] xl:h-[222px] xl:w-full">
          {image ? (
            <Image
              width={326}
              height={222}
              src={image}
              alt={imageAlt}
              priority
              className="object-cover h-full w-full"
            />
          ) : (
            <LoadingIcon />
          )}
        </div>
        <div className="w-full mb-3">
          <h3 className="text-fg-primary xl:text-xl font-semibold mb-2 xl:mb-3">
            {heading}
          </h3>
          {content}
        </div>
      </div>
      {buttons}
    </div>
  );
}
