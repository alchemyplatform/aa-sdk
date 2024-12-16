/* eslint-disable import/extensions */
import { RNAlchemySigner } from "@account-kit/react-native-signer";
import type { User } from "@account-kit/signer";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";
import Config from "react-native-config";

export default function HomeScreen() {
  const [email, setEmail] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const signer = new RNAlchemySigner({
    client: { connection: { apiKey: Config.API_KEY! } },
  });

  const handleUserAuth = ({ bundle }: { bundle: string }) => {
    signer
      .authenticate({
        bundle,
        type: "email",
      })
      .then(setUser)
      .catch(console.error);
  };

  const handleIncomingURL = (event: { url: string }) => {
    const regex = /[?&]([^=#]+)=([^&#]*)/g;

    let params: Record<string, string> = {};
    let match: RegExpExecArray | null;

    while ((match = regex.exec(event.url))) {
      if (match[1] && match[2]) {
        params[match[1]] = match[2];
      }
    }

    if (!params.bundle || !params.orgId) {
      return;
    }

    handleUserAuth({
      bundle: params.bundle ?? "",
    });
  };

  useEffect(() => {
    // get the user if already logged in
    signer.getAuthDetails().then(setUser);
  }, []);

  // Add listener for incoming links
  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleIncomingURL);

    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      {!user ? (
        <>
          <TextInput
            style={styles.textInput}
            placeholderTextColor="gray"
            placeholder="enter your email"
            onChangeText={setEmail}
            value={email}
          />
          {/* TODO: implement OTP */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              signer
                .authenticate({ email, type: "email", emailMode: "magicLink" })
                .catch(console.error);
            }}
          >
            <Text style={styles.buttonText}>Sign in</Text>
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
