"use client";
import { useEffect } from "react";
import { ls } from "../../../../strings.js";
import { Button } from "../../../button.js";
import { disconnect } from "@account-kit/core";
import { useAlchemyAccountContext } from "../../../../context.js";

type ConnectionErrorProps = {
  headerText: string;
  bodyText: string;
  tryAgainCTA?: string;
  icon: React.ReactNode;
  handleTryAgain?: () => void;
  handleUseAnotherMethod?: () => void;
  shouldDisconnect?: boolean;
  handleSkip?: () => void;
};

export const ConnectionError = ({
  headerText,
  bodyText,
  tryAgainCTA,
  icon,
  handleTryAgain,
  handleUseAnotherMethod,
  shouldDisconnect = true,
  handleSkip,
}: ConnectionErrorProps) => {
  const { config } = useAlchemyAccountContext();

  useEffect(() => {
    // Terminate any inflight authentication on Error...
    if (shouldDisconnect) {
      disconnect(config);
    }
  }, [config, shouldDisconnect]);

  return (
    <div className="flex flex-col justify-center content-center gap-3">
      <div className="flex justify-center">
        <div className="w-[48px] h-[48px] flex justify-center items-center">
          {icon}
        </div>
      </div>
      <h2 className="font-semibold text-lg text-center">{headerText}</h2>
      <p className="text-sm text-center text-fg-secondary">{bodyText}</p>
      <Button className="mt-3" onClick={handleTryAgain}>
        {tryAgainCTA ?? ls.error.cta.tryAgain}
      </Button>
      {handleUseAnotherMethod && (
        <Button
          onClick={handleUseAnotherMethod}
          variant={"social"}
          className="border-0 bg-btn-secondary"
        >
          {ls.error.cta.useAnotherMethod}
        </Button>
      )}
      {handleSkip && (
        <Button
          onClick={handleSkip}
          variant={"social"}
          className="border-0 bg-btn-secondary"
        >
          {ls.error.cta.skip}
        </Button>
      )}
    </div>
  );
};
