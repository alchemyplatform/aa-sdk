/* eslint-disable import/extensions */
import type { User } from "@account-kit/signer";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import Config from "react-native-config";
import { RNAlchemySigner } from "@account-kit/react-native-signer";

const signer = RNAlchemySigner({
  client: { connection: { apiKey: Config.API_KEY! } },
});

export default function OTPAuthScreen() {
  const [email, setEmail] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  const [awaitingOtp, setAwaitingOtp] = useState<boolean>(false);

  const [otpCode, setOtpCode] = useState<string>("");

  const handleUserAuth = ({ code }: { code: string }) => {
    setAwaitingOtp(false);
    signer
      .authenticate({
        otpCode: code,
        type: "otp",
      })
      .then((res) => {
        console.log("res", res);
        setUser(res);
      })
      .catch(console.error);
  };

  useEffect(() => {
    // get the user if already logged in
    signer.getAuthDetails().then(setUser);
  }, []);

  return (
    <View style={styles.container}>
      {awaitingOtp ? (
        <>
          <TextInput
            style={styles.textInput}
            placeholderTextColor="gray"
            placeholder="enter your OTP code"
            onChangeText={setOtpCode}
            value={otpCode}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleUserAuth({ code: otpCode })}
          >
            <Text style={styles.buttonText}>Sign in</Text>
          </TouchableOpacity>
        </>
      ) : !user ? (
        <>
          <TextInput
            style={styles.textInput}
            placeholderTextColor="gray"
            placeholder="enter your email"
            onChangeText={setEmail}
            value={email}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              signer
                .authenticate({
                  email,
                  type: "email",
                  emailMode: "otp",
                })
                .catch(console.error);
              setAwaitingOtp(true);
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
