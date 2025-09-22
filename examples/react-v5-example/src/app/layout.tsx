import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers.js";

export const metadata: Metadata = {
  title: "Alchemy Smart Wallet Demo",
  description: "Demo for Alchemy Smart Wallet SDK v5 using React",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
