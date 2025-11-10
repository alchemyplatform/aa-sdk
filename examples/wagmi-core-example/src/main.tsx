import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/App.js";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
