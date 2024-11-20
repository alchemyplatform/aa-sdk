import React, { useEffect, useRef, useState } from "react";

export type OTPCodeType = [string, string, string, string, string];
export const initialValue: OTPCodeType = ["", "", "", "", ""];

type OTPInputProps = {
  errorText?: string;
  value: OTPCodeType;
  setValue: React.Dispatch<React.SetStateAction<OTPCodeType>>;
  setErrorText: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
  handleReset: () => void;
};

const isOTPCodeType = (arg: string[]): arg is OTPCodeType => {
  return (
    Array.isArray(arg) &&
    arg.every((item: string) => typeof item === "string") &&
    arg.length === 5
  );
};

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  setValue,
  errorText,
  disabled,
  setErrorText,
  handleReset,
}) => {
  const [autoComplete, setAutoComplete] = useState<string>("");
  const [activeElement, setActiveElement] = useState<number | null>(0);

  const refs = useRef<Array<HTMLInputElement | null>>([]);
  // Initialize refs
  useEffect(() => {
    refs.current = refs.current.slice(0, initialValue.length);
    if (refs.current[0]) {
      refs.current[0].focus();
    }
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
    if (e.target.value.length === 5) {
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
    const pasteData = e.clipboardData.getData("text/plain").split("");
    if (isOTPCodeType(pasteData)) {
      setValue(pasteData);
    } else {
      setErrorText(
        "Paste does not match the code structure, please copy the entire code"
      );
    }
  };

  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "Backspace":
        if (activeElement !== null) {
          e.preventDefault();
          focusPreviousElement();
        }
        break;
      case "ArrowLeft":
        if (activeElement !== null) {
          e.preventDefault();
          focusPreviousElement();
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        if (activeElement !== null && activeElement < 4) focusNextElement();
        break;
      case "Spacebar": {
        e.preventDefault();
        break;
      }
    }
  };

  return (
    <div>
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
      <div>
        <label>Code</label>
      </div>
      <div className="flex gap-2">
        {initialValue.map((_, i) => (
          <input
            className="border h-7 w-7 rounded text-center"
            ref={(el) => (refs.current[i] = el)}
            tabIndex={i + 1}
            type="text"
            aria-label={`One time password input for the ${i + 1} digit`}
            inputMode="numeric"
            pattern="[0-9]*"
            //Fix for ios chrome autocomplete
            maxLength={i === 0 ? 5 : 1}
            onFocus={() => setActiveElement(i)}
            onPaste={handlePaste}
            onChange={(e) => handleChange(e, i)}
            onClick={() => handleClick(i)}
            onInput={focusNextElement}
            onKeyDown={handleKeydown}
            key={i}
            disabled={disabled}
            value={value[i]}
            aria-invalid={!!errorText}
          />
        ))}
      </div>
      {errorText && <p className="text-red-500">{errorText}</p>}
    </div>
  );
};
