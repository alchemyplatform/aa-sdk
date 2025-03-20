export function Card({
  imageSlot,
  heading,
  content,
  buttons,
  badgeSlot,
}: {
  imageSlot: React.ReactNode;
  heading: string;
  content: React.ReactNode;
  buttons: React.ReactNode;
  badgeSlot?: React.ReactNode;
}) {
  return (
    <div className="bg-bg-surface-default rounded-lg p-4 w-full xl:p-6 xl:w-[326px] xl:h-[570px] flex flex-col border hover:border-fg-tertiary mb-5 xl:mb-0 min-h-[220px]">
      <div className="flex xl:flex-col gap-4 relative">
        <div className="absolute top-[-6px] left-[-6px] sm:top-1 sm:left-1 xl:left-auto xl:right-3 xl:top-3 z-10">
          {badgeSlot}
        </div>
        <div className="flex-shrink-0 sm:mb-3 xl:mb-0 rounded-lg overflow-hidden  flex items-center justify-center h-[67px] w-[60px] sm:h-[154px] sm:w-[140px] xl:h-[222px] xl:w-full">
          {imageSlot}
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
