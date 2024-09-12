import type { Meta, StoryObj } from "@storybook/react";
import { ConnectionError, walletTypeConfig } from "./connection-error.jsx";

const meta: Meta<typeof ConnectionError> = {
  title: "Errors/ConnectionError",
  component: ConnectionError,
  args: {
    connectionType: "passkey",
    walletType: walletTypeConfig["com.coinbase.wallet"].key,
  },
  argTypes: {
    connectionType: {
      control: {
        type: "radio",
        defaultValue: "passkey",
        options: ["passkey", "wallet"],
      },
    },
    walletType: {
      control: {
        type: "radio",
        options: Object.keys(walletTypeConfig),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ConnectionError>;
export const Default: Story = {};
