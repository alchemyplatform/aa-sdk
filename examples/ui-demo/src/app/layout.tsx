import GoogleAnalytics from "@/components/shared/GoogleAnalytics";
import {
  cookieToInitialConfig,
  generateClassesForRoot,
  generateStylesForRoot,
} from "@/state/store";
import { cookieToInitialState } from "@account-kit/core";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { alchemyConfig } from "./config";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Account Kit Demo",
  description: "Powered by Alchemy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(
    alchemyConfig(),
    headers().get("cookie") ?? undefined
  );

  const initialConfig = cookieToInitialConfig(headers().get("cookie"));

  const classes = initialConfig
    ? generateClassesForRoot(initialConfig)
    : ["light"];
  const styles = initialConfig ? generateStylesForRoot(initialConfig) : [];

  return (
    <html
      lang="en"
      className={classes.join(" ")}
      style={Object.fromEntries(styles)}
    >
      <head>
        <GoogleAnalytics />
      </head>
      <body className={inter.className}>
        <Providers initialState={initialState} initialConfig={initialConfig}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
