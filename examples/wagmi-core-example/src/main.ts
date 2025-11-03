import { Buffer } from "buffer";
import {
  connect,
  disconnect,
  reconnect,
  watchAccount,
  getAccount,
  signMessage,
  verifyMessage,
  switchChain,
  signTypedData,
  verifyTypedData,
  sendCalls,
} from "@wagmi/core";
import { config } from "./wagmi.js";
import "./style.css";
import { zeroAddress } from "viem";

globalThis.Buffer = Buffer;

// DOM helpers
function updateStatus(elementId: string, message: string) {
  const element = document.getElementById(elementId);
  if (element) element.innerText = message;
}

function getInputValue(elementId: string): string {
  const input = document.getElementById(elementId) as HTMLInputElement;
  return input?.value || "";
}

const appHtml = `
  <div>
    <h1>Wagmi + Alchemy Smart Wallet</h1>

    <div id="connect">
      <h2>Connect</h2>
      <div class="connect-group">
        <h3>Alchemy Smart Wallet (recommended)</h3>
        <div id="smartwallet"></div>
      </div>
      <div class="connect-group">
        <h3>Other wallet connectors (EOA/3p)</h3>
        <div id="others"></div>
      </div>
    </div>

    <div id="account"></div>

    <div id="wallet-actions">
      <h2>Wallet Actions</h2>

      <form id="message-form">
        <input type="text" id="message-input" placeholder="Enter message" required />
        <button id="sign-message" type="submit">Sign message</button>
      </form>

      <button id="sign-typed-data" type="button">Sign Typed Data</button>

      <div>
        <button id="send-calls" type="button">Send calls</button>
        <div id="smart-wallet-status"></div>
      </div>
    </div>

    <div id="session-controls">
      <h2>Session Controls</h2>
      <div id="session-status"></div>
      <button id="disconnect-btn" type="button" class="disconnect-btn">
        Disconnect
      </button>
    </div>
  </div>
`;

setupApp(document.querySelector<HTMLDivElement>("#app")!);

function setupConnectorButtons(element: HTMLDivElement) {
  const connectElement = element.querySelector<HTMLDivElement>("#connect");
  const smartDiv = element.querySelector<HTMLDivElement>("#smartwallet")!;
  const othersDiv = element.querySelector<HTMLDivElement>("#others")!;

  const connectors = config.connectors;
  const smart = connectors.find((c: any) => (c as any).type === "alchemy-smart-wallet" || c.name === "Alchemy Smart Wallet");
  const others = connectors.filter((c) => c !== smart);

  smartDiv.innerHTML = smart ? `<button class="connect" id="${(smart as any).uid}">${smart.name}</button>` : "";
  othersDiv.innerHTML = others
    .map((c) => `<button class="connect" id="${(c as any).uid}">${c.name}</button>`)
    .join("");

  const buttons = element.querySelectorAll<HTMLButtonElement>(".connect");
  for (const button of buttons) {
    const connector = connectors.find((conn: any) => (conn as any).uid === button.id)!;
    button.addEventListener("click", async () => {
      try {
        const errorElement = element.querySelector<HTMLDivElement>("#error");
        if (errorElement) errorElement.remove();
        await connect(config, { connector });
      } catch (error) {
        const errorElement = document.createElement("div");
        errorElement.id = "error";
        errorElement.innerText = (error as Error).message;
        connectElement?.appendChild(errorElement);
      }
    });
  }
}

function setupAccountWatcher(element: HTMLDivElement) {
  watchAccount(config, {
    onChange(account) {
      const accountElement = element.querySelector<HTMLDivElement>("#account")!;
      accountElement.innerHTML = `
        <h2>Account</h2>
        <div>
          status: ${account.status}<br />
          addresses: ${account.addresses ? JSON.stringify(account.addresses) : ""}<br />
          chainId: ${account.chainId ?? ""}
        </div>
        ${
          account.status === "connected"
            ? `<div id="chain-buttons">
                ${config.chains
                  .map(
                    (chain) =>
                      `<button class="chain-btn" data-chain-id="${chain.id}" type="button">
                        Switch to ${chain.name}
                      </button>`,
                  )
                  .join("")}
              </div>
              <button id="disconnect" type="button">Disconnect</button>`
            : ""
        }
      `;

      const disconnectButton =
        element.querySelector<HTMLButtonElement>("#disconnect");
      if (disconnectButton) {
        disconnectButton.addEventListener("click", () => disconnect(config));
      }

      const chainButtons =
        element.querySelectorAll<HTMLButtonElement>(".chain-btn");
      chainButtons.forEach((button) => {
        button.addEventListener("click", async () => {
          const chainId = parseInt(
            button.getAttribute("data-chain-id") || "0",
            10,
          );
          await handleSwitchChain(chainId);
        });
      });

      updateSessionStatus();
    },
  });
}

function setupWalletActions() {
  const messageForm = document.querySelector<HTMLFormElement>("#message-form");
  messageForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleSignMessage();
  });

  const signTypedDataButton = document.getElementById("sign-typed-data");
  signTypedDataButton?.addEventListener("click", handleSignTypedData);

  const sendCallsButton = document.getElementById("send-calls");
  sendCallsButton?.addEventListener("click", handleSendCalls);
}

function setupSessionControls() {
  const disconnectButton = document.getElementById("disconnect-btn");
  disconnectButton?.addEventListener("click", handleDisconnect);

  updateSessionStatus();
}

function updateSessionStatus() {
  const account = getAccount(config);
  const status = account.status;
  updateStatus("session-status", `Session: ${status}`);
}

async function handleSignMessage() {
  const account = getAccount(config);
  if (account.status !== "connected") {
    alert("Not connected");
    return;
  }
  try {
    const message = getInputValue("message-input");
    const signature = await signMessage(config, { message });
    const isValid = await verifyMessage(config, {
      address: account.address,
      message,
      signature,
    });
    alert(`Signature: ${signature}\n\n Verified: ${isValid}`);
  } catch (error) {
    console.error(error);
    alert("Failed to sign message");
  }
}

async function handleSignTypedData() {
  const account = getAccount(config);
  if (account.status !== "connected") {
    alert("Not connected");
    return;
  }
  try {
    const typedData = {
      domain: { name: "Example DApp", version: "1", chainId: account.chainId },
      types: {
        Mail: [
          { name: "from", type: "address" },
          { name: "to", type: "address" },
          { name: "contents", type: "string" },
        ],
      },
      primaryType: "Mail" as const,
      message: {
        from: account.address,
        to: account.address,
        contents: "Hello from Alchemy Smart Wallet!",
      },
    };
    const signature = await signTypedData(config, typedData as any);
    const isValid = await verifyTypedData(config, {
      ...typedData,
      signature,
      address: account.address,
    });
    console.log({ typedData, signature, isValid });
    alert(`Typed Data Signature: ${signature}\n\n Verified: ${isValid}`);
  } catch (error) {
    console.error(error);
    alert("Failed to sign typed data");
  }
}

async function handleSendCalls() {
  const account = getAccount(config);
  if (account.status !== "connected") {
    alert("Not connected");
    return;
  }
  try {
    updateStatus(
      "smart-wallet-status",
      "Sending call (see console for more info)...",
    );
    const result = await sendCalls(config, {
      calls: [{ to: zeroAddress, data: "0x" }],
    });
    updateStatus("smart-wallet-status", `Result: ${result.id}`);
  } catch (error) {
    console.error("Call failed:", error);
    updateStatus("smart-wallet-status", `Error: ${(error as Error).message}`);
  }
}

async function handleSwitchChain(chainId: number) {
  try {
    switchChain(config, { chainId });
  } catch (error) {
    console.error(error);
    alert("Failed to switch chain");
  }
}

function handleDisconnect() {
  disconnect(config);
}

function setupApp(element: HTMLDivElement) {
  element.innerHTML = appHtml;
  setupConnectorButtons(element);
  setupAccountWatcher(element);
  setupWalletActions();
  setupSessionControls();

  setTimeout(async () => {
    try {
      await reconnect(config);
    } catch {
      // No existing session
    }
  }, 100);
}
