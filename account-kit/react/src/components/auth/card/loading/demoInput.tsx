import type { InputHTMLAttributes } from "react";
import { Input } from "../../../input.js";

type DemoInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "ref">;

/*
 * Input used for demoing new functionality. Should be replaced and deleted when
 * designs are ready.
 */
export const DemoInput = (props: DemoInputProps) => {
  return (
    <div className="relative">
      <Input className="pointer-events-none" />
      <Input
        {...props}
        className="absolute border-none bg-transparent left-0 top-0"
        style={{
          transform: "rotate(10deg) scale(1.65)",
          transformOrigin: "0 50%",
        }}
      />
    </div>
  );
};
