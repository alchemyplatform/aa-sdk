export function Badge({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`px-2 py-1 font-semibold rounded-md text-xs ${className}`}
      style={style}
    >
      {text}
    </div>
  );
}
