/* eslint-disable import/extensions */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  Clipboard,
} from "react-native";
import { useUser, useSigner, useLogout } from "@account-kit/react-native";

export default function MFAScreen() {
  const user = useUser();
  const signer = useSigner();
  const { logout } = useLogout();
  
  const [loading, setLoading] = useState(false);
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [totpUrl, setTotpUrl] = useState<string | null>(null);
  const [multiFactorId, setMultiFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [showQrCode, setShowQrCode] = useState(false);
  const [verifyMode, setVerifyMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const extractSecretFromTotpUrl = (url: string): string => {
    const secretMatch = url.match(/secret=([A-Z0-9]+)/i);
    return secretMatch ? secretMatch[1] : "";
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchMfaFactors = async () => {
    if (!signer?.getMfaFactors) return;
    
    try {
      setLoading(true);
      const { multiFactors } = await signer.getMfaFactors();
      setMfaFactors(multiFactors || []);
    } catch (error) {
      console.error("Error fetching MFA factors:", error);
      Alert.alert("Error", "Failed to fetch MFA factors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && signer) {
      fetchMfaFactors();
    }
  }, [user, signer]);

  const handleAddMfa = async () => {
    if (!signer?.addMfa) {
        console.log("signer.addMfa is not available");
        return;
    };
    
    try {
      setLoading(true);
      const result = await signer.addMfa({
        multiFactorType: "totp",
      });
      
      setTotpUrl(result.multiFactorTotpUrl);
      setMultiFactorId(result.multiFactorId);
      setShowQrCode(true);
      setVerifyMode(true);
    } catch (error) {
      console.error("Error adding MFA:", error);
      Alert.alert("Error", "Failed to add MFA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!signer?.verifyMfa || !multiFactorId || !verificationCode) return;
    
    try {
      setLoading(true);
      await signer.verifyMfa({
        multiFactorId,
        multiFactorCode: verificationCode,
      });
      
      Alert.alert("Success", "MFA verified successfully");
      setVerificationCode("");
      setTotpUrl(null);
      setMultiFactorId(null);
      setShowQrCode(false);
      setVerifyMode(false);
      fetchMfaFactors();
    } catch (error) {
      console.error("Error verifying MFA:", error);
      Alert.alert("Error", "Failed to verify MFA. Please check your code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMfa = async (factorId: string) => {
    if (!signer?.removeMfa) return;
    
    try {
      setLoading(true);
      await signer.removeMfa({
        multiFactorIds: [factorId],
      });
      
      Alert.alert("Success", "MFA factor removed successfully");
      fetchMfaFactors();
    } catch (error) {
      console.error("Error removing MFA:", error);
      Alert.alert("Error", "Failed to remove MFA factor");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please log in first</Text>
        <Text style={styles.subtitle}>You need to log in before managing MFA settings</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Multi-Factor Authentication</Text>
        <Text style={styles.subtitle}>Secure your account with an authenticator app</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#93C5FD" style={styles.loader} />
        ) : (
          <>
            {showQrCode && totpUrl ? (
              <View style={styles.qrContainer}>
                <Text style={styles.instruction}>
                  Scan this QR code with your authenticator app (like Google Authenticator)
                </Text>
                <View style={styles.qrCodeWrapper}>
                  <Text style={styles.qrCodeFallback}>
                    Or manually enter this secret code in your authenticator app:
                  </Text>
                  <View style={styles.secretContainer}>
                    <Text style={styles.secretCode} selectable>
                      {totpUrl ? extractSecretFromTotpUrl(totpUrl) : ""}
                    </Text>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={() => totpUrl && copyToClipboard(extractSecretFromTotpUrl(totpUrl))}
                    >
                      <Text style={styles.copyButtonText}>
                        {copied ? "Copied!" : "Copy"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {verifyMode && (
                  <View style={styles.verifyContainer}>
                    <Text style={styles.instruction}>
                      Enter the 6-digit code from your authenticator app
                    </Text>
                    <TextInput
                      style={styles.codeInput}
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      placeholder="Enter 6-digit code"
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleVerifyMfa}
                      disabled={verificationCode.length !== 6}
                    >
                      <Text style={styles.buttonText}>Verify</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.cancelButton]}
                      onPress={() => {
                        setShowQrCode(false);
                        setVerifyMode(false);
                        setTotpUrl(null);
                        setMultiFactorId(null);
                        setVerificationCode("");
                      }}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Your MFA Factors</Text>
                {mfaFactors.length > 0 ? (
                  mfaFactors.map((factor) => (
                    <View key={factor.multiFactorId} style={styles.factorItem}>
                      <Text style={styles.factorText}>
                        {factor.multiFactorType.toUpperCase()} Factor
                      </Text>
                      <TouchableOpacity
                        style={[styles.button, styles.removeButton]}
                        onPress={() => handleRemoveMfa(factor.multiFactorId)}
                      >
                        <Text style={styles.buttonText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noFactors}>No MFA factors configured</Text>
                )}
                
                <TouchableOpacity style={styles.button} onPress={handleAddMfa}>
                  <Text style={styles.buttonText}>Add Authenticator App</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  loader: {
    marginVertical: 30,
  },
  button: {
    width: 200,
    padding: 10,
    height: 50,
    backgroundColor: "rgb(147, 197, 253)",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  qrContainer: {
    alignItems: "center",
    width: "100%",
    marginVertical: 20,
  },
  qrCodeWrapper: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginVertical: 20,
    width: "100%",
  },
  qrCodeFallback: {
    textAlign: "center",
    marginBottom: 10,
  },
  secretContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 5,
    marginVertical: 10,
    width: "100%",
  },
  secretCode: {
    fontSize: 18,
    textAlign: "center",
    padding: 10,
    flex: 1,
    fontFamily: "monospace",
    letterSpacing: 1,
    color: "#0066cc",
  },
  copyButton: {
    padding: 10,
    backgroundColor: "rgb(147, 197, 253)",
    borderRadius: 5,
    marginLeft: 10,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  instruction: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  verifyContainer: {
    width: "100%",
    alignItems: "center",
  },
  codeInput: {
    width: "60%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 5,
  },
  factorItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 10,
  },
  factorText: {
    fontSize: 16,
  },
  removeButton: {
    width: 100,
    height: 40,
    marginTop: 0,
    backgroundColor: "#ff6b6b",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  noFactors: {
    fontStyle: "italic",
    color: "#999",
    marginVertical: 20,
  },
}); 