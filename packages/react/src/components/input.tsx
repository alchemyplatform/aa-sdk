type BaseProps = {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "ref">;

type Props = {
  label?: string;
  hint?: string;
} & BaseProps;

const BaseInput = ({
  iconLeft,
  iconRight,
  error,
  className,
  ...props
}: BaseProps) => {
  return (
    <label
      className={`akui-input ${props.disabled ? "input-disabled" : ""} ${
        error ? "input-error" : ""
      } ${className ?? ""}`}
    >
      {iconLeft}
      <input {...props} className="text-base sm:text-sm" />
      {iconRight}
    </label>
  );
};

// this isn't used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const Input = ({ label, hint, ...props }: Props) => {
  if (label || hint || props.error) {
    return (
      <label className="akui-form-controls">
        {label && <span className="akui-form-label">{label}</span>}
        <BaseInput {...props} />
        {(props.error ?? hint) && (
          <span className="akui-form-hint">{props.error ?? hint}</span>
        )}
      </label>
    );
  }

  return <BaseInput {...props} />;
};
