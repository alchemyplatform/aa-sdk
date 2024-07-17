import Link, { LinkProps } from "next/link";

const ExternalLink = ({
  className,
  children,
  ...rest
}: LinkProps & { className?: string; children: React.ReactNode }) => {
  return (
    <Link
      {...rest}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </Link>
  );
};

export default ExternalLink;
