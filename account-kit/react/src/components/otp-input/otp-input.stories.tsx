import type { Meta, StoryObj } from "@storybook/react";
import { initialValue, OTPInput, type OTPCodeType } from "./otp-input.jsx";
import { useState } from "react";

const meta: Meta<typeof OTPInput> = {
  component: OTPInput,
  title: "OTPInput",
};
export default meta;
type Story = StoryObj<typeof OTPInput>;

export const Default: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState<OTPCodeType>(initialValue);
    return (
      <OTPInput
        value={value}
        setValue={setValue}
        handleReset={() => {}}
        setErrorText={() => {}}
      />
    );
  },
};
