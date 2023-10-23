import React, { type ReactElement } from "react";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";

import { useWalletContext } from "@context/wallet";
import FormImage from "@shared-components/atom/FormImage";
import FormText from "@shared-components/atom/FormText";
import Row from "@shared-components/atom/Row";
import { colors } from "@theme/color";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as NavigationService from "react-navigation-helpers";
import { Routes } from "types/navigation";
import ProfileWalletAddress from "./ProfileWalletAddress";

const ProfileHeader = (): ReactElement => {
  const { top } = useSafeAreaInsets();
  const { magicAuth, scaAddress: address } = useWalletContext();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            height: 168 + top,
          },
        ]}
      >
        <ImageBackground
          source={require("../../assets/logo/kit-logo.png")}
          resizeMode="cover"
          blurRadius={15}
          style={{ flex: 1 }}
        >
          <View style={{ marginTop: top, alignItems: "flex-end" }}>
            <Row style={styles.headerButtons}>
              <Pressable
                style={styles.headerButton}
                onPress={(): void => {
                  NavigationService.push(Routes.Setting);
                }}
              >
                <Icon type={IconType.FontAwesome5} name={"cog"} size={28} />
              </Pressable>
            </Row>
          </View>
        </ImageBackground>
      </View>

      <View style={{ backgroundColor: "white", paddingHorizontal: 20 }}>
        <View style={styles.profileImgBox}>
          <FormImage
            source={require("../../assets/logo/kit-logo.png")}
            resizeMode="cover"
            style={{ flex: 1, borderRadius: 50 }}
            size={100}
          />
        </View>

        {magicAuth && (
          <Row style={{ columnGap: 12 }}>
            {magicAuth.email && (
              <View style={styles.section}>
                <FormText size={20} font={"B"}>
                  {magicAuth.email.split("@")[0] ?? "User"}
                </FormText>
              </View>
            )}
            <ProfileWalletAddress address={address} />
          </Row>
        )}
      </View>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  container: { backgroundColor: "white" },
  header: {
    backgroundColor: colors.black._90010,
  },
  profileImgBox: {
    borderRadius: 999,
    marginTop: -60,
  },
  section: {
    paddingBottom: 12,
    flex: 1,
  },
  headerButtons: {
    padding: 10,
  },
  headerButton: {
    marginHorizontal: 5,
    padding: 5,
  },
});
