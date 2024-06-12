import { useState } from "react";
import { Authentication } from "./Authentication";
import { Tab, Tabs } from "../shared/Tabs";
import { LockIcon } from "../icons/lock";
import { PaintIcon } from "../icons/paint";

const TABS: Tab[] = [
  {
    id: "authentication",
    name: "Authentication",
    icon: <LockIcon />,
  },
  {
    id: "style",
    name: "Styling",
    icon: <PaintIcon />,
  },
];

export const Configuration = () => {
  const [tab, setTab] = useState<string>("authentication");

  return (
    <div className="flex flex-col">
      <Tabs tabs={TABS} activeTab={tab} setActive={setTab} />
      {tab === "authentication" ? <Authentication className="pt-6" /> : <div />}
    </div>
  );
};
