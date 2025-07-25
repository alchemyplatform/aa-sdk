import type { Meta, StoryObj } from "@storybook/react";
import { http, HttpResponse } from "msw";
import { useEffect } from "react";
import { useUiConfig } from "../../../hooks/useUiConfig.js";
import type { AuthType } from "../types.js";
import { AuthCard } from "./index.jsx";
const Test = (props: any) => {
  const { updateConfig } = useUiConfig(({ updateConfig }) => ({
    updateConfig,
  }));

  let sections: AuthType[][] = [
    [{ type: "email" as const }],
    [{ type: "passkey" as const }],
  ];
  if (props.authType === "email") {
    sections = [[{ type: "email" as const }]];
  }
  if (props.authType === "passkey") {
    sections = [[{ type: "passkey" as const }]];
  }
  if (props.authType === "email-passkey") {
    sections = [[{ type: "email" as const }], [{ type: "passkey" as const }]];
  }

  if (props.authType === "external_wallets") {
    sections = [
      [
        {
          type: "external_wallets",
          walletConnect: {
            projectId: "30e7ffaff99063e68cc9870c105d905b",
          },
        },
      ],
    ];
  }
  if (props.authType === "all") {
    sections = [
      [{ type: "email" as const }],
      [{ type: "passkey" as const }],
      [
        {
          type: "external_wallets",
          walletConnect: {
            projectId: "30e7ffaff99063e68cc9870c105d905b",
          },
        },
      ],
    ];
  }

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
    };

    updateConfig(uiConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.authType]);

  return (
    <div className="mt-20">
      <AuthCard />
    </div>
  );
};

const meta: Meta<typeof Test> = {
  title: "AuthCard",
  component: Test,
  argTypes: {
    authType: {
      options: ["email", "passkey", "email-passkey", "external_wallets", "all"],
      control: { type: "radio" },
    },
  },
  args: {
    authType: "email-passkey",
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

type Story = StoryObj<typeof Test>;
export const Default: Story = {
  args: {
    authType: "email",
  },
};

export const withLookupError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/api/rpc/signer/v1/lookup", () => {
          return new HttpResponse(null, {
            status: 500,
            statusText: "MSW server error from Storybook",
          });
        }),
      ],
    },
  },
};

export const withSignupError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/api/rpc/signer/v1/signup", () => {
          return new HttpResponse(null, {
            status: 500,
            statusText: "MSW server error from Storybook",
          });
        }),
      ],
    },
  },
};
