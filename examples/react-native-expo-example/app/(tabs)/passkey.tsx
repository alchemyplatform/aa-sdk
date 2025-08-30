import { useAuthenticate, useUser, useLogout, useSigner, useSignerStatus } from "@account-kit/react-native";
import React, { useState, useEffect } from "react";
import { 
  Alert, 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet,
  ScrollView,
  Platform
} from "react-native";

export default function PasskeyScreen() {
  const { authenticateAsync } = useAuthenticate();
  const { logout } = useLogout();
  const user = useUser();
  const signer = useSigner();
  const { status } = useSignerStatus()
  const [username, setUsername] = useState("testuser");
  const [isCreating, setIsCreating] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Monitor user state changes
  useEffect(() => {
    console.log("=== USER STATE CHANGED ===");
    console.log("User:", user);
    console.log("Signer:", signer);
    if (signer) {
      signer.getAddress().then(addr => {
        console.log("Signer address:", addr);
      }).catch(e => {
        console.log("Error getting signer address:", e);
      });
    }
  }, [user, signer]);

  const handleCreatePasskey = async () => {
    try {
      console.log("=== PASSKEY CREATE START ===");
      console.log("Username:", username || "App User");
      console.log("User before auth:", user);
      console.log("Signer:", signer);
      
      setIsCreating(true);
      const result = await authenticateAsync({
        type: "passkey",
        createNew: true,
        // This will be the name of the saved passkey on the user's device
        username: username || "App User",
      });

      console.log(result)
      
      console.log("=== PASSKEY CREATE RESULT ===");
      console.log("Auth result:", result);
      console.log("User after auth:", user);
      
      Alert.alert("Success", `Passkey created! Check console for details.`);
    } catch (e: any) {
      console.error("=== PASSKEY CREATE ERROR ===");
      console.error("Full error:", e);
      console.error("Error message:", e?.message);
      console.error("Error code:", e?.code);
      console.error("Error stack:", e?.stack);
      console.error("Error name:", e?.name);
      
      // Try to get more details about where it's failing
      if (e?.stack) {
        console.error("=== STACK TRACE ===");
        console.error(e.stack);
      }
      
      // Check if it's a specific error type
      console.error("Error constructor:", e?.constructor?.name);
      console.error("Error toString:", e?.toString());
      
      Alert.alert("Error", `Error: ${e?.message || "Unknown error"}`);
      throw e
    } finally {
      setIsCreating(false);
    }
  };

  const handleLoginWithPasskey = async () => {
    try {
      console.log("=== PASSKEY LOGIN START ===");
      console.log("User before auth:", user);
      
      setIsAuthenticating(true);
      const result = await authenticate({
        type: "passkey",
        createNew: false,
      });
      
      console.log("=== PASSKEY LOGIN RESULT ===");
      console.log("Auth result:", result);
      console.log("User after auth:", user);
      
      Alert.alert("Success", "Check console for auth details!");
    } catch (e: any) {
      console.error("=== PASSKEY LOGIN ERROR ===");
      console.error("Full error:", e);
      console.error("Error message:", e?.message);
      console.error("Error code:", e?.code);
      Alert.alert("Error", `Error: ${e?.message || "Unknown error"}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (user) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Passkey Authentication Success!</Text>
          <View style={styles.infoSection}>
            <Text style={styles.label}>User Email:</Text>
            <Text style={styles.value}>{user.email || "N/A"}</Text>

            <Text style={styles.label}>Signer status: </Text>
            <Text style={styles.value}>{status || "N/A"}</Text>
            
            
            <Text style={styles.label}>User Address:</Text>
            <Text style={styles.value}>{user.address || "N/A"}</Text>
            
            <Text style={styles.label}>Org ID:</Text>
            <Text style={styles.value}>{user.orgId || "N/A"}</Text>
          </View>
          
          <Pressable
            style={[styles.button, styles.logoutButton]}
            onPress={() => logout()}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Passkey Authentication Demo</Text>
        <Text style={styles.subtitle}>
          Test passkey creation and authentication
        </Text>

        <View style={styles.divider} />

        {/* Create New Passkey Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create New Account with Passkey</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username for passkey"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
          />
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.createButton,
              pressed && styles.buttonPressed,
              isCreating && styles.buttonDisabled
            ]}
            onPress={handleCreatePasskey}
            disabled={isCreating}
          >
            <Text style={styles.buttonText}>
              {isCreating ? "Creating..." : "Create Passkey Account"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Login with Existing Passkey Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Login with Existing Passkey</Text>
          <Text style={styles.description}>
            Use an existing passkey saved on this device
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.loginButton,
              pressed && styles.buttonPressed,
              isAuthenticating && styles.buttonDisabled
            ]}
            onPress={handleLoginWithPasskey}
            disabled={isAuthenticating}
          >
            <Text style={styles.buttonText}>
              {isAuthenticating ? "Authenticating..." : "Login with Passkey"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Configuration Info:</Text>
          <Text style={styles.infoText}>
            Platform: {Platform.OS}
          </Text>
          <Text style={styles.infoText}>
            Domain: bug-terrorism-nylon-minnesota.trycloudflare.com
          </Text>
          <Text style={styles.infoText}>
            Package: com.accountkit.reactnativeexpoexample
          </Text>
        </View>

        {/* Debug Section */}
        <View style={[styles.infoSection, { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8 }]}>
          <Text style={styles.infoTitle}>Debug Info:</Text>
          <Text style={styles.infoText}>
            User State: {user ? `Logged in (${user.email || user.address || 'unknown'})` : 'Not logged in'}
          </Text>
          <Text style={styles.infoText}>
            Check Metro console for detailed logs
          </Text>
          <Text style={[styles.infoText, { fontSize: 10, marginTop: 8 }]}>
            If passkey shows success but user is null, check:
          </Text>
          <Text style={[styles.infoText, { fontSize: 10 }]}>
            1. assetlinks.json is accessible at domain/.well-known/
          </Text>
          <Text style={[styles.infoText, { fontSize: 10 }]}>
            2. SHA256 fingerprint matches your debug keystore
          </Text>
          <Text style={[styles.infoText, { fontSize: 10 }]}>
            3. rpId matches your tunnel domain exactly
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  createButton: {
    backgroundColor: "rgb(79, 70, 229)",
  },
  loginButton: {
    backgroundColor: "rgb(34, 197, 94)",
  },
  logoutButton: {
    backgroundColor: "rgb(239, 68, 68)",
    marginTop: 20,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 20,
  },
  infoSection: {
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
});