/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect } from "react";
import { useAuthContext } from "../../context.js";

import { LoadingOtp } from "./otp.js";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof LoadingOtp> = {
  title: "OTP/LoadingOTP",
  component: LoadingOtp,
  parameters: {},
  render: () => {
    const { authStep, setAuthStep } = useAuthContext();
    useEffect(() => {
      setAuthStep({ type: "otp_verify", email: "test@alchemy.com" });
    }, [setAuthStep]);
    if (authStep.type === "otp_verify") {
      return <LoadingOtp />;
    }

    return <p className="text-red-500">initializing story</p>;
  },
};
export default meta;

type Story = StoryObj<typeof LoadingOtp>;
export const Default: Story = {};
