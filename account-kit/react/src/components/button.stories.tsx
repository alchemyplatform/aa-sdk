import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button.js";

const meta: Meta<typeof Button> = {
  component: Button,
  title: "Button",
  args: {
    variant: "primary",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: {
        type: "radio",
        options: ["primary", "secondary", "social"],
      },
    },
    disabled: {
      control: {
        type: "boolean",
      },
    },
    onClick: {
      action: "clicked",
    },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: (args) => {
    return <Button {...args}>Default</Button>;
  },
};
