import {
  RNAlchemySigner,
  type ExportWalletResult,
} from "@account-kit/react-native-signer";
import { Alert } from "react-native";

// Example usage of wallet export in React Native

async function exportPrivateKey() {
  // Initialize the signer
  const signer = RNAlchemySigner({
    client: {
      connection: {
        apiKey: "YOUR_API_KEY",
      },
      rpId: "your-app.com", // Required for passkey support
    },
  });

  try {
    // Method 1: Basic export (returns boolean)
    // This is compatible with the base class interface
    const success = await signer.exportWallet();
    if (success) {
      console.log("Wallet export initiated successfully");
      // Note: This doesn't return the actual export bundle
    }

    // Method 2: Export with result (recommended for React Native)
    // This returns the encrypted export bundle that needs to be decrypted
    const exportResult: ExportWalletResult =
      await signer.exportWalletWithResult();

    // The export bundle is encrypted and needs to be decrypted
    // using the stamper's private key
    console.log("Export bundle received:", exportResult.exportBundle);
    console.log("Wallet address:", exportResult.address);
    console.log("Organization ID:", exportResult.orgId);

    // IMPORTANT: Handle the export bundle securely
    // Options for handling the export bundle:
    // 1. Display in a secure modal/screen that prevents screenshots
    // 2. Store in secure device storage (iOS Keychain, Android Keystore)
    // 3. Allow user to copy to clipboard with security warnings

    // Example: Show alert with security warning
    Alert.alert(
      "⚠️ Private Key Export",
      "Your private key export bundle has been generated. This is encrypted data that contains your private key.\n\n" +
        "Keep this information secure and never share it with anyone.",
      [
        {
          text: "I Understand",
          style: "default",
        },
      ],
    );

    return exportResult;
  } catch (error) {
    console.error("Failed to export wallet:", error);
    Alert.alert(
      "Export Failed",
      "Unable to export wallet. Please ensure you are authenticated and try again.",
    );
    throw error;
  }
}

// Example of using the client directly
async function exportWithClient() {
  const { RNSignerClient } = await import("@account-kit/react-native-signer");

  const client = new RNSignerClient({
    connection: {
      apiKey: "YOUR_API_KEY",
    },
    rpId: "your-app.com",
  });

  // First authenticate the user (example with email)
  await client.initEmailAuth({
    email: "user@example.com",
  });

  // After authentication...
  const exportResult = await client.exportWalletWithResult();

  return exportResult;
}

export { exportPrivateKey, exportWithClient };
