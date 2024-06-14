interface ErrorContainerProps {
  error?: Error | string;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export const ErrorContainer = ({ error }: ErrorContainerProps) => {
  return (
    <div className="flex flex-row gap-2 p-1 items-center rounded-lg bg-bg-surface-critical text-fg-critical text-xs">
      <div className="rounded-lg bg-fg-critical text-fg-invert font-semibold font-xs py-1 px-2">
        Error
      </div>
      <div className="font-normal">
        {error != null ? error.toString() : "Oops! Something went wrong"}
      </div>
    </div>
  );
};
