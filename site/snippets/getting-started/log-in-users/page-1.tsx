"use client";

import { LogInCard } from "../components/LogInCard.jsx";
import { TurnkeyIframe } from "../components/TurnkeyIframe.jsx";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      <LogInCard />
      <TurnkeyIframe />
    </main>
  );
}
