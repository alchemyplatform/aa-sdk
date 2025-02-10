import React, { useEffect, useRef, useState } from "react";
import { ls } from "../../strings.js";

export type OTPCodeType = [string, string, string, string, string, string];
export const initialOTPValue: OTPCodeType = ["", "", "", "", "", ""];
const OTP_LENGTH = 6;
type OTPInputProps = {
  errorText?: string;
  value: OTPCodeType;
  setValue: (otpCode: OTPCodeType) => void;
  setErrorText: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
  handleReset: () => void;
  className?: string;
  isVerified?: boolean;
};

export const isOTPCodeType = (arg: string[]): arg is OTPCodeType => {
  return (
    Array.isArray(arg) &&
    arg.every((item: string) => typeof item === "string" && item !== "") &&
    arg.length === OTP_LENGTH
  );
};

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  setValue,
  errorText,
  disabled,
  setErrorText,
  handleReset,
  className,
  isVerified,
}) => {
  const [autoComplete, setAutoComplete] = useState<string>("");
  const [activeElement, setActiveElement] = useState<number | null>(0);

  const refs = useRef<Array<HTMLInputElement | null>>([]);
  // Initialize refs
  useEffect(() => {
    refs.current = refs.current.slice(0, OTP_LENGTH);
    refs.current[0]?.focus();
  }, []);
  // Select active element when active element value changes
  useEffect(() => {
    if (activeElement !== null && refs.current[activeElement]) {
      refs.current[activeElement]?.select();
      refs.current[activeElement]?.focus();
    }
  }, [activeElement]);

  useEffect(() => {
    const newValue = autoComplete.split("");
    if (isOTPCodeType(newValue)) {
      setValue(newValue);
    }
  }, [autoComplete, setValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    //Fix for ios chrome autocomplete
    if (e.target.value.length === OTP_LENGTH) {
      const chromeIOSAutocomplete = e.target.value.split("");
      if (isOTPCodeType(chromeIOSAutocomplete)) {
        setValue(chromeIOSAutocomplete);
        setActiveElement(null);
        return;
      }
    }
    const newValue = [...value] as OTPCodeType;
    newValue.splice(i, 1, e.target.value);
    setErrorText("");
    setValue(newValue);
    focusNextElement();
  };

  const handleClick = (i: number) => {
    refs.current[i]?.select();
    setActiveElement(i);
    setErrorText("");
  };

  const focusNextElement = () => {
    const nextElement = activeElement ? activeElement + 1 : 1;
    setActiveElement(nextElement);
  };

  const focusPreviousElement = () => {
    const previousElement = activeElement ? activeElement - 1 : 0;
    setActiveElement(previousElement);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text/plain")
      .split("")
      .slice(0, OTP_LENGTH);
    if (isOTPCodeType(pasteData)) {
      setValue(pasteData);
    } else {
      setErrorText(ls.error.otp.invalid);
    }
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (activeElement === null) return;
    switch (e.key) {
      case "Backspace":
        e.preventDefault();
        const newValue = [...value] as OTPCodeType;
        newValue.splice(activeElement, 1, "");
        setValue(newValue);
        focusPreviousElement();
        break;
      case "ArrowLeft":
        e.preventDefault();
        focusPreviousElement();
        break;
      case "ArrowRight":
        e.preventDefault();
        if (activeElement < OTP_LENGTH - 1) focusNextElement();
        break;
      case "Spacebar": {
        break;
      }
    }
  };

  return (
    <div className={`flex flex-col gap-2 items-center ${className}`}>
      {/* Input for autocomplete, visibility hidden */}
      <input
        className="invisible h-0 w-0 p-[0] m-[-1px]"
        tabIndex={-1}
        aria-hidden
        autoComplete="one-time-code"
        value={autoComplete}
        onChange={(e) => setAutoComplete(e.target.value)}
        onClick={handleReset}
      />
      <div className="flex gap-2.5">
        {initialOTPValue.map((_, i) => (
          <input
            className={`
              border w-8 h-10 rounded text-center 
              focus:outline-none focus:border-active 
              ${!disabled ? "bg-bg-surface-default text-fg-primary" : ""}
              ${!!errorText ? "border-fg-critical" : ""} 
              ${isVerified ? "border-fg-success" : ""}
              ${
                disabled
                  ? "border-fg-disabled bg-bg-surface-inset text-fg-disabled"
                  : ""
              }
            `}
            ref={(el) => (refs.current[i] = el)}
            tabIndex={i + 1}
            type="text"
            aria-label={`One time password input for the ${i + 1} digit`}
            inputMode="numeric"
            pattern="[0-9]*"
            //Fix for ios chrome autocomplete
            maxLength={i === 0 ? OTP_LENGTH : 1}
            onFocus={() => setActiveElement(i)}
            onPaste={handlePaste}
            onChange={(e) => handleChange(e, i)}
            onClick={() => handleClick(i)}
            onInput={focusNextElement}
            onKeyDown={handleKeydown}
            key={i}
            disabled={disabled || isVerified}
            value={value[i]}
            aria-invalid={!!errorText}
          />
        ))}
      </div>
      {errorText && (
        <p className="text-fg-critical text-sm text-center">{errorText}</p>
      )}
    </div>
  );
};
