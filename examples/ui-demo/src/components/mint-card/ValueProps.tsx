import { MintStatus } from "./MintCard";
import { LoadingIcon } from "../icons/loading";
import { CheckIcon } from "../icons/check";
import { GasIcon } from "../icons/gas";
import { DrawIcon } from "../icons/draw";
import { ReceiptIcon } from "../icons/receipt";

type Props = {
  status: MintStatus;
} & React.HTMLAttributes<HTMLDivElement>;

// TODO(jh): delete this file
export function ValueProps({ status, ...props }: Props) {
  return (
    <div {...props}>
      <ValueProp
        title="Invisible signing"
        className="mb-6"
        icon={status.signing}
        description="Sign actions in the background with embedded wallets"
      />

      <ValueProp
        title="Gas sponsorship"
        className="mb-6"
        icon={status.gas}
        description={
          <span>
            Sponsor gas fees to remove barriers to adoption.{" "}
            <a
              href="https://accountkit.alchemy.com/react/sponsor-gas"
              target="_blank"
              referrerPolicy="no-referrer"
              className="font-medium text-fg-accent-brand"
            >
              Learn how.
            </a>
          </span>
        }
      />
      <ValueProp
        title="Batch transactions"
        className="lg:mb-6"
        icon={status.batch}
        description="Deploy the user's smart account in their first transaction"
      />
    </div>
  );
}
const ValueProp = ({
  icon,
  title,
  description,
  className,
}: {
  icon: "signing" | "gas" | "batch" | "loading" | "success";
  title: string;
  description: string | JSX.Element;
  className?: string;
}) => {
  return (
    <div className={`flex gap-3 ${className}`}>
      <div className="w-5 lg:w-6">{getMintIcon(icon)}</div>
      <div className=" max-w-[308px]">
        <h3 className="text-base font-semibold text-fg-secondary">{title}</h3>
        <p className="text-base leading-6 text-fg-secondary">{description}</p>
      </div>
    </div>
  );
};

const getMintIcon = (
  icon: "signing" | "gas" | "batch" | "loading" | "success"
) => {
  switch (icon) {
    case "signing":
      return <DrawIcon className="fill-fg-secondary" />;
    case "gas":
      return <GasIcon className="fill-fg-secondary" />;
    case "batch":
      return <ReceiptIcon className="fill-fg-secondary" />;
    case "loading":
      return <LoadingIcon />;
    case "success":
      return <CheckIcon className="stroke-demo-surface-success" />;
  }
};
