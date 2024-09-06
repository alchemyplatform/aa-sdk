import type { Meta, StoryObj } from "@storybook/react";
import { GeneralError } from "./general-error.js";

const Container = () => {
  return (
    <div className="flex justify-center">
      <div className="max-w-96 center">
        <GeneralError />
      </div>
    </div>
  );
};
const meta: Meta<typeof GeneralError> = {
  title: "Errors/General Error",
  component: Container,
};
export default meta;

type Story = StoryObj<typeof GeneralError>;
export const Default: Story = {};
