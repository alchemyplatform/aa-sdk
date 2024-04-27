"use client";

import { DemoSet } from "@alchemy/aa-alchemy/react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-row gap-4 p-24">
      <DemoSet>Primary</DemoSet>
      <DemoSet type="secondary">Secondary</DemoSet>
      <DemoSet type="social">Google</DemoSet>
    </main>
  );
}
