/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from "@storybook/react";
import { initialValue, OTPInput, type OTPCodeType } from "./otp-input.jsx";
import { userEvent, within, expect, waitFor } from "@storybook/test";
import { useState } from "react";

const meta: Meta<typeof OTPInput> = {
  component: OTPInput,
  title: "OTPInput",
  render: (args) => {
    const [value, setValue] = useState<OTPCodeType>(initialValue);
    const [errorText, setErrorText] = useState<string>("");
    const handleReset = () => {
      setErrorText("");
      setValue(initialValue);
    };
    return (
      <OTPInput
        {...args}
        value={value}
        setValue={setValue}
        handleReset={handleReset}
        setErrorText={setErrorText}
        errorText={errorText}
      />
    );
  },
};
export default meta;
type Story = StoryObj<typeof OTPInput>;

export const Default: Story = {};

export const TestTyping: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole("textbox");

    // Test typing individual numbers
    await userEvent.type(inputs[0], "1");
    await userEvent.type(inputs[1], "2");
    await userEvent.type(inputs[2], "3");
    await userEvent.type(inputs[3], "4");
    await userEvent.type(inputs[4], "5");
    await userEvent.type(inputs[5], "6");

    // Verify values
    expect(inputs[0]).toHaveValue("1");
    expect(inputs[1]).toHaveValue("2");
    expect(inputs[2]).toHaveValue("3");
    expect(inputs[3]).toHaveValue("4");
    expect(inputs[4]).toHaveValue("5");
    expect(inputs[5]).toHaveValue("6");
  },
};

export const TestPasting: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole("textbox");

    // Simulate paste event
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", "123456");

    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData,
      bubbles: true,
      cancelable: true,
    });

    inputs[0].dispatchEvent(pasteEvent);

    await waitFor(() => {
      expect(inputs[0]).toHaveValue("1");
      expect(inputs[1]).toHaveValue("2");
      expect(inputs[2]).toHaveValue("3");
      expect(inputs[3]).toHaveValue("4");
      expect(inputs[4]).toHaveValue("5");
      expect(inputs[5]).toHaveValue("6");
    });
  },
};

export const TestKeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole("textbox");

    // Focus first input
    await userEvent.click(inputs[0]);
    expect(document.activeElement).toBe(inputs[0]);

    // Test right arrow
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(inputs[1]);

    // Test left arrow
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(inputs[0]);

    // Test backspace
    await userEvent.type(inputs[0], "1");
    await userEvent.keyboard("{Backspace}");
    await userEvent.keyboard("{Backspace}");
    expect(inputs[0]).toHaveValue("");
    expect(document.activeElement).toBe(inputs[0]);
    await userEvent.type(inputs[0], "1");
    await userEvent.keyboard("23456");
  },
};

export const TestAutoFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole("textbox");

    // Check if first input is focused on mount
    expect(document.activeElement).toBe(inputs[0]);
  },
};

export const TestErrorState: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test invalid paste
    const inputs = canvas.getAllByRole("textbox");
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", "123"); // Invalid length

    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData,
      bubbles: true,
      cancelable: true,
    });

    inputs[0].dispatchEvent(pasteEvent);

    // Check for error message
    await waitFor(() => {
      const errorMessage = canvas.getByText(
        /The code you entered is incorrect/i
      );
      expect(errorMessage).toBeInTheDocument();
    });
  },
};

export const TestDisabledState: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole("textbox");

    // Verify all inputs are disabled
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });

    // Try to type (should not work)
    await userEvent.type(inputs[0], "1");
    expect(inputs[0]).toHaveValue("");
  },
};
