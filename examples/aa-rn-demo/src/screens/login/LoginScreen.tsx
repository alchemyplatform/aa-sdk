import { useTheme } from "@react-navigation/native";
import { Card, Divider } from "@rneui/themed";
import React, { useMemo } from "react";
import { TextInput, View } from "react-native";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";

/**
 * ? Local Imports
 */
import { useWalletContext } from "@context/wallet";
import { IconButton } from "@shared-components/button/IconButton";
import { TouchableButton } from "@shared-components/button/TouchableButton";
import { IconType } from "react-native-dynamic-vector-icons";
import createStyles from "./LoginScreen.style";

interface LoginScreenProps {}

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [loginWithEmail, setLoginWithEmail] = React.useState<boolean>(false);
  const [loginWithSMS, setLoginWithSMS] = React.useState<boolean>(false);
  const [input, setInput] = React.useState<string>("");

  const { login } = useWalletContext();

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            { flexGrow: 1, justifyContent: "center" },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Email Login */}
          <Card>
            {loginWithEmail || loginWithSMS ? (
              <>
                <Card.Title style={{ marginTop: 24 }}>
                  {loginWithEmail ? "Email OTP Login" : "Login with SMS"}
                </Card.Title>
                <View style={styles.loginContainer}>
                  <View style={styles.emailContainer}>
                    <TextInput
                      style={styles.TextInputContainer}
                      onChangeText={(text) => setInput(text)}
                      value={input}
                      placeholder={`Enter your ${
                        loginWithEmail ? "email" : "phone number"
                      }`}
                    />
                  </View>
                </View>
                <View
                  style={[
                    styles.margin10,
                    {
                      flexDirection: "row",
                      marginTop: 24,
                      justifyContent: "center",
                      alignContent: "center",
                      marginStart: -24,
                    },
                  ]}
                >
                  <IconButton
                    onPress={() => {
                      setLoginWithEmail(false);
                      setLoginWithSMS(false);
                      setInput("");
                    }}
                    size={24}
                    name="chevron-left"
                    type={IconType.FontAwesome5}
                    containerStyle={{ padding: 6, marginHorizontal: 12 }}
                  />
                  <TouchableButton
                    disabled={input.length < 1}
                    handler={() =>
                      login(
                        loginWithEmail ? input : undefined,
                        !loginWithEmail ? input : undefined,
                      )
                    }
                    title="Login with SMS"
                  />
                </View>
              </>
            ) : (
              <>
                <Card.Title style={{ marginTop: 24 }}>
                  Login To Your Account
                </Card.Title>
                <View
                  style={{
                    flexDirection: "row",
                    flex: 1,
                    marginVertical: 24,
                    justifyContent: "center",
                    columnGap: 60,
                  }}
                >
                  <IconButton
                    onPress={() => {
                      setLoginWithEmail(true);
                      setLoginWithSMS(false);
                    }}
                    size={36}
                    name="envelope"
                    type={IconType.FontAwesome5}
                  />
                  <IconButton
                    size={36}
                    onPress={() => {
                      setLoginWithEmail(false);
                      setLoginWithSMS(true);
                    }}
                    name="comment"
                    type={IconType.FontAwesome5}
                  />
                </View>
              </>
            )}

            <Divider
              inset={true}
              insetType="middle"
              style={{ marginVertical: 24 }}
            />
          </Card>
        </ScrollView>
      </GestureHandlerRootView>
    </View>
  );
};

export default LoginScreen;
