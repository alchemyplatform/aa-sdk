import type { Meta, StoryObj } from "@storybook/react";
import { ConnectionError } from "./connection-error.jsx";

const meta: Meta<typeof ConnectionError> = {
  title: "Errors/ConnectionError",
  component: ConnectionError,
  args: {
    connectionType: "passkey",
    walletType: "Coinbase Wallet",
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
        options: ["Coinbase Wallet", "MetaMask", "WalletConnect"],
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ConnectionError>;
export const Default: Story = {};
