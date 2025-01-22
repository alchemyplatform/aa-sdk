import React from "react";
import { Configuration } from "./Configuration";
import { Authentication } from "./Authentication";
import { Styling } from "./Styling";

export function ConfigurationWrapper() {
  return (
    <div className=" flex-col w-[272px] lg:w-[392px] bg-white border border-border rounded-lg p-6 overflow-y-auto scrollbar-none gap-10">
      <Configuration />
      <Authentication />
      <Styling />
    </div>
  );
}
