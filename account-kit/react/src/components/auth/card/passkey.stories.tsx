import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { useEffect } from "react";
import { useUiConfig } from "../../../hooks/useUiConfig.js";
import { useAuthContext } from "../context.js";
import type { AuthType } from "../types.js";
import { AuthCard } from "./index.jsx";

const PasskeyStory = (props: any) => {
  const { updateConfig } = useUiConfig(({ updateConfig }) => ({
    updateConfig,
  }));

  let sections: AuthType[][] = [[{ type: "passkey" as const }]];

  const ui = {
    theme: "dark",
    primaryColor: {
      light: "red",
      dark: "#9AB7FF",
    },
    borderRadius: "sm",
    illustrationStyle: "outline",
    logoLight: undefined,
    logoDark: undefined,
  };

  useEffect(() => {
    const uiConfig = {
      auth: {
        showEmail: true,
        showExternalWallets: false,
        showPasskey: true,
        addPasskey: true,
        sections,
      },
      ui,
      supportUrl: "#",
    };

    updateConfig(uiConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.authType]);

  const { setAuthStep } = useAuthContext();
  useEffect(() => {
    setAuthStep({ type: "passkey_create" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthCard {...props} />;
};

const meta: Meta<typeof PasskeyStory> = {
  title: "Passkey",
  component: PasskeyStory,
  args: {
    authType: "passkey",
  },

  parameters: {
    msw: {
      handlers: [
        http.post("/api/rpc/signer/v1/lookup", () => {
          return HttpResponse.json({
            orgId: "483c1263-a6e3-4db1-a8b0-894e4902e404",
          });
        }),
      ],
    },
  },
};
export default meta;

type Story = StoryObj<typeof AuthCard>;
export const Default: Story = {};
