/* eslint-disable import/extensions */
import { RNSignerClient } from "@account-kit/react-native-signer";
import type { User } from "@account-kit/signer";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import Config from "react-native-config";

export default function App() {
  const [email, setEmail] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [bundle, setBundle] = useState<string>("");
  const [orgId, setOrgId] = useState<string>("");
  const signer = new RNSignerClient({
    connection: { apiKey: Config.API_KEY! },
  });

  // Test the localstorage polyfill
  localStorage.setItem("test", "This is from localstorage polyfill");

  const test = localStorage.getItem("test");

  return (
    <View style={styles.container}>
      <Text>User: {user ? JSON.stringify(user) : "none"}</Text>
      <TextInput
        placeholder="email"
        onChangeText={setEmail}
        value={email}
      ></TextInput>
      <Button
        title="Sign in"
        onPress={() => {
          signer
            .initEmailAuth({ email })
            .then(({ orgId }) => setOrgId(orgId))
            .catch(console.error);
        }}
      ></Button>
      <TextInput
        placeholder="bundle"
        onChangeText={setBundle}
        value={bundle}
      ></TextInput>
      <Button
        title="Complete auth"
        onPress={() => {
          signer
            .completeAuthWithBundle({
              bundle,
              authenticatingType: "email",
              connectedEventName: "connectedEmail",
              orgId,
            })
            .then(setUser)
            .catch(console.error);
        }}
      ></Button>
      <Text>{test}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
