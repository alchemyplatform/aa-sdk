import { RNAlchemySigner, type ExportWalletResult } from "@account-kit/react-native-signer";
import { Alert } from "react-native";

/**
 * Example: Export private key using the local storage approach
 * 
 * This implementation uses Turnkey's recommended approach for mobile:
 * 1. Generate a P256 key pair locally
 * 2. Request export encrypted to the public key
 * 3. Decrypt the bundle using HPKE with the private key
 * 4. Clean up the key from storage
 */
async function exportPrivateKey() {
  const signer = RNAlchemySigner({
    client: {
      connection: {
        apiKey: "YOUR_API_KEY",
      },
      rpId: "your-app.com", // Required for passkey support
    },
  });

  try {
    // Export as private key
    const result: ExportWalletResult = await signer.exportWalletWithResult({
      exportAs: "PRIVATE_KEY"
    });
    
    console.log("Private key exported successfully");
    console.log("Address:", result.address);
    console.log("Private key:", result.privateKey);
    
    // IMPORTANT: Handle the private key securely
    Alert.alert(
      "⚠️ Private Key Exported",
      "Your private key has been exported. Keep this information extremely secure:\n\n" +
      `Address: ${result.address}\n\n` +
      "Never share your private key with anyone!",
      [
        {
          text: "I Understand",
          style: "default",
          onPress: () => {
            // Optionally copy to secure clipboard or save securely
          }
        },
      ]
    );

    return result;
  } catch (error) {
    console.error("Failed to export private key:", error);
    Alert.alert(
      "Export Failed",
      "Unable to export wallet. Please ensure you are authenticated and try again."
    );
    throw error;
  }
}

/**
 * Example: Export seed phrase
 */
async function exportSeedPhrase() {
  const signer = RNAlchemySigner({
    client: {
      connection: {
        apiKey: "YOUR_API_KEY",
      },
      rpId: "your-app.com",
    },
  });

  try {
    // Export as seed phrase
    const result: ExportWalletResult = await signer.exportWalletWithResult({
      exportAs: "SEED_PHRASE"
    });
    
    console.log("Seed phrase exported successfully");
    console.log("Address:", result.address);
    console.log("Seed phrase:", result.seedPhrase);
    
    Alert.alert(
      "🔐 Seed Phrase Exported",
      "Your recovery phrase has been exported. This is the ONLY way to recover your wallet:\n\n" +
      "• Write it down on paper\n" +
      "• Store it in a secure location\n" +
      "• Never share it with anyone\n" +
      "• Never store it digitally unless encrypted",
      [
        {
          text: "I've Secured My Phrase",
          style: "default",
        },
      ]
    );

    return result;
  } catch (error) {
    console.error("Failed to export seed phrase:", error);
    throw error;
  }
}

/**
 * Example: Using the base exportWallet method (returns boolean)
 */
async function exportWalletBasic() {
  const signer = RNAlchemySigner({
    client: {
      connection: {
        apiKey: "YOUR_API_KEY",
      },
      rpId: "your-app.com",
    },
  });

  try {
    // This method returns true/false but doesn't give you the actual key
    // Use exportWalletWithResult() to get the decrypted data
    const success = await signer.exportWallet({ exportAs: "PRIVATE_KEY" });
    
    if (success) {
      console.log("Export completed successfully");
      // Note: You don't get the actual key with this method
    }
    
    return success;
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

/**
 * Example: Direct client usage
 */
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
  
  // After authentication, export the wallet
  const result = await client.exportWalletWithResult({
    exportAs: "PRIVATE_KEY"
  });
  
  return result;
}

/**
 * Security Best Practices:
 * 
 * 1. Never log private keys in production
 * 2. Use secure storage if you need to persist keys
 * 3. Implement screenshot prevention during export
 * 4. Add user authentication before allowing export
 * 5. Consider using biometric authentication
 * 6. Warn users about the risks of exporting keys
 * 7. Clear clipboard after copying sensitive data
 * 
 * The export uses HPKE encryption with a locally generated P256 key pair,
 * ensuring that neither Turnkey nor your app backend can access the
 * decrypted private key - only the user's device has access.
 */

export { 
  exportPrivateKey, 
  exportSeedPhrase, 
  exportWalletBasic,
  exportWithClient 
};