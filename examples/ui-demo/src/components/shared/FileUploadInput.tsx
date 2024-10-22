"use client";

import React, { ChangeEvent, useRef } from "react";

interface FileUploadInputProps {
  children: React.ReactNode;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  [key: string]: any;
  className?: string;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({
  children,
  onChange,
  accept = "image/*",
  className,
  ...props
}) => {
  const ref = useRef<HTMLInputElement>(null);

  const selectImage = () => {
    if (ref.current) {
      // reset the current value so that the input's onChange handler fires even if the
      // user keeps selecting the same file
      ref.current.value = "";
      ref.current.click();
    }
  };

  return (
    <button
      className={className}
      onClick={selectImage}
      onKeyDown={selectImage}
      type="button"
    >
      {children}
      <input
        {...props}
        ref={ref}
        onChange={onChange}
        className="hidden"
        type="file"
        size={10000}
        accept={accept}
      />
    </button>
  );
};

export default FileUploadInput;
