import { InfoIcon } from "../icons/info";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export const HelpTooltip = ({ text }: { text: string }) => {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger>
          <InfoIcon />
        </TooltipTrigger>
        <TooltipContent
          align="start"
          alignOffset={-16}
          className="bg-foreground text-background max-w-[256px] px-3 py-2 rounded-md"
        >
          <TooltipArrow />
          <p className="text-xs">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
