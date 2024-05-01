"use client";

import { DemoSet } from "@alchemy/aa-alchemy/react";
import { JSX, SVGProps } from "react";
// eslint-disable-next-line import/extensions
import { useAuthModal } from "./AuthModal";

// TODO: move this into the aa-alchemy package
const MailIcon = ({
  fill = "#475569",
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={16}
    fill="none"
    {...props}
  >
    <path
      fill={fill}
      fillRule="evenodd"
      d="M1.335 2.705 9 8.07l7.665-5.365a1.048 1.048 0 0 0-.998-.747H2.333c-.469 0-.87.317-.998.747ZM16.708 4.2l-7.35 5.145a.625.625 0 0 1-.716 0L1.292 4.2V13c0 .572.47 1.042 1.041 1.042h13.334c.571 0 1.041-.47 1.041-1.042V4.2ZM.042 3A2.297 2.297 0 0 1 2.333.708h13.334A2.297 2.297 0 0 1 17.958 3v10a2.297 2.297 0 0 1-2.291 2.292H2.333A2.297 2.297 0 0 1 .042 13V3Z"
      clipRule="evenodd"
    />
  </svg>
);

const ChevronRight = ({
  fill = "#475569",
  ...props
}: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <path
      fill="#000"
      fillRule="evenodd"
      d="M7.058 4.558a.625.625 0 0 1 .884 0l5 5a.625.625 0 0 1 0 .884l-5 5a.625.625 0 1 1-.884-.884L11.616 10 7.058 5.442a.625.625 0 0 1 0-.884Z"
      clipRule="evenodd"
    />
  </svg>
);

export default function Home() {
  const { openAuthModal, AuthModal } = useAuthModal({});

  return (
    <>
      <main className="flex min-h-screen flex-row gap-6 p-24">
        <DemoSet>Primary</DemoSet>
        <DemoSet type="secondary">Secondary</DemoSet>
        <DemoSet type="social">Google</DemoSet>
        <div className="flex flex-col gap-4">
          <label className="form-controls">
            <span className="form-label">Normal Input</span>
            <label className="input">
              <MailIcon />
              <input placeholder="Input" />
              <ChevronRight className="match-input" />
            </label>
            <span className="form-hint">This is a hint text to help user.</span>
          </label>
          <label className="form-controls">
            <span className="form-label">Disabled Input</span>
            <label className="input input-disabled">
              <MailIcon />
              <input placeholder="Input" />
              <ChevronRight className="match-input" />
            </label>
            <span className="form-hint">This is a hint text to help user.</span>
          </label>
          <label className="form-controls">
            <span className="form-label">Error Input</span>
            <label className="input input-error">
              <MailIcon />
              <input placeholder="Input" />
              <ChevronRight className="match-input" />
            </label>
            <span className="form-hint">This is a hint text to help user.</span>
          </label>
        </div>
        <button className="btn btn-primary" onClick={openAuthModal}>
          Open Auth Modal
        </button>
      </main>

      <AuthModal />
    </>
  );
}
