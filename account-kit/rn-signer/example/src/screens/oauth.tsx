/* eslint-disable import/extensions */
import type { User } from "@account-kit/signer";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import signer from "../signer";

export default function OAuthScreen() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // get the user if already logged in
    signer.getAuthDetails().then(setUser);
    signer.initOauth();
  }, []);

  return (
    <View style={styles.container}>
      {!user ? (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              signer
                .authenticate({
                  type: "oauth",
                  mode: "redirect",
                  authProviderId: "google",
                  redirectUrl: "rn-signer-demo://oauth",
                })
                .then((user) => {
                  // Get user details after a successful authentication
                  setUser(user);
                })
                .catch(console.error);
            }}
          >
            <Text style={styles.buttonText}>Sign in with OAuth</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.userText}>
            Currently logged in as: {user.email}
          </Text>
          <Text style={styles.userText}>OrgId: {user.orgId}</Text>
          <Text style={styles.userText}>Address: {user.address}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => signer.disconnect().then(() => setUser(null))}
          >
            <Text style={styles.buttonText}>Sign out</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFF",
    paddingHorizontal: 20,
  },
  textInput: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginTop: 20,
    marginBottom: 10,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
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
  userText: {
    marginBottom: 10,
    fontSize: 18,
  },
});
