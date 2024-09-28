import type { Meta, StoryObj } from "@storybook/react";
import { ConnectionError } from "./connection-error.jsx";
import { EOAWallets } from "./types.js";

const meta: Meta<typeof ConnectionError> = {
  title: "Errors/ConnectionError",
  component: ConnectionError,
  args: {
    connectionType: "passkey",
    EOAConnector: EOAWallets.WALLET_CONNECT,
  },
  argTypes: {
    connectionType: {
      control: {
        type: "radio",
        defaultValue: "passkey",
        options: ["passkey", "wallet"],
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ConnectionError>;
export const Default: Story = {};
