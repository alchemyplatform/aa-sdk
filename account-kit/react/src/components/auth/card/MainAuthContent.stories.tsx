import type { Meta, StoryObj } from "@storybook/react";
import { AuthCardContent } from "./index.jsx";
export default {
  title: "MainAuthContent",
  component: AuthCardContent,
} as Meta;

type Story = StoryObj<typeof AuthCardContent>;
export const Default: Story = {};
