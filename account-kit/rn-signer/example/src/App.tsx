/* eslint-disable import/extensions */
import { NativeTEKStamper } from "@account-kit/react-native-signer";
import type { User } from "@account-kit/signer";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { SignerClient } from "./signer";

export default function App() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [bundle, setBundle] = useState<string>("");
  const [orgId, setOrgId] = useState<string>("");
  const signer = new SignerClient();

  useEffect(() => {
    const init = async () => {
      console.log("init again");

      await NativeTEKStamper.init()
        .then((publicKey) => {
          console.log("publicKey", publicKey);
          setPublicKey(publicKey);
        })
        .catch(console.error);
    };

    init();
  }, []);

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
              orgId: orgId,
            })
            .then(setUser)
            .catch(console.error);
        }}
      ></Button>
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
