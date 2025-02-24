import React from "react";
import { Authentication } from "./Authentication";
import { Styling } from "./Styling";
import { Configuration } from "./Configuration";

export function ConfigurationSidebarWrapper() {
  return (
    <div className="hidden lg:block w-[272px] lg:w-[392px] bg-white border border-border rounded-lg p-6 overflow-y-auto scrollbar-none">
      <Authentication />
      <Configuration />
      <Styling />
    </div>
  );
}
