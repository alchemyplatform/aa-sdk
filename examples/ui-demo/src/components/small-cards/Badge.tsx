export function Badge({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={`px-2 py-1 font-semibold rounded-md text-xs ${className}`}>
      {text}
    </div>
  );
}
