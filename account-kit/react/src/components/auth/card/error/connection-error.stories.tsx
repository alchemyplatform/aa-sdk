import type { Meta, StoryObj } from "@storybook/react";
import { ConnectionError, walletTypeConfig } from "./connection-error.jsx";
import { EOAWallets } from "./types.js";

const meta: Meta<typeof ConnectionError> = {
  title: "Errors/ConnectionError",
  component: ConnectionError,
  args: {
    connectionType: "passkey",
    walletType: EOAWallets.COINBASE_WALLET,
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
        options: walletTypeConfig.map((w) => w.key),
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ConnectionError>;
export const Default: Story = {};
