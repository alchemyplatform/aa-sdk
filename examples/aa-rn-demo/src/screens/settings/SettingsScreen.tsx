import React, { useState, type ReactElement } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import * as NavigationService from "react-navigation-helpers";

/**
 * ? Local Imports
 */
import { useAlertContext } from "@context/alert";
import { useWalletContext } from "@context/wallet";
import Clipboard from "@react-native-clipboard/clipboard";
import Container from "@shared-components/atom/Container";
import FormModal from "@shared-components/atom/FormModal";
import FormText from "@shared-components/atom/FormText";
import Header from "@shared-components/atom/Header";
import Row from "@shared-components/atom/Row";
import ViewHorizontalDivider from "@shared-components/atom/ViewHorizontalDivider";
import { chain } from "@shared-config/env";
import { colors } from "@theme/color";
import Icon, { IconType } from "react-native-dynamic-vector-icons";

interface SettingsScreenProps {}

const SettingTextItem = (props: {
  name: string;
  text?: string;
  copiable?: boolean;
}): ReactElement => {
  const { dispatchAlert } = useAlertContext();
  const { name, text } = props;
  const inner = (
    <View style={styles.item}>
      <Row style={{ columnGap: 8 }}>
        <FormText
          font={"B"}
          color={colors.black._900}
          style={{ marginBottom: 8 }}
        >
          {name}
        </FormText>
        {props.copiable && (
          <Icon
            name="copy"
            type={IconType.FontAwesome5}
            color={colors.black._500}
            style={{ marginTop: 2 }}
            size={14}
          />
        )}
      </Row>
      <FormText style={{ fontWeight: "400" }} color={colors.primary._400}>
        {text}
      </FormText>
    </View>
  );
  if (!props.copiable || !props.text) return inner;
  return (
    <TouchableOpacity
      onPress={(): void => {
        dispatchAlert({
          type: "open",
          alertType: "info",
          message: `${name} copied`,
        });
        Clipboard.setString(props.text!);
      }}
    >
      {inner}
    </TouchableOpacity>
  );
};

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const { auth, scaAddress, logout } = useWalletContext();

  const [visibleSignOutModal, setVisibleSignOutModal] =
    useState<boolean>(false);

  return (
    <Container
      style={[styles.container]}
      safeAreaBackgroundColor={colors.black._90005}
    >
      <View style={styles.body}>
        <Header
          left="back"
          onPressLeft={() => {
            NavigationService.goBack();
          }}
          containerStyle={{ backgroundColor: "transparent" }}
        />
        <View style={styles.itemGroup}>
          <SettingTextItem name={"Chain"} text={chain.name} />
          <ViewHorizontalDivider />
          {auth.email && <SettingTextItem name={"Email"} text={auth.email} />}
          <ViewHorizontalDivider />
          {auth.phoneNumber && (
            <SettingTextItem name={"Phone Number"} text={auth.phoneNumber} />
          )}
          <ViewHorizontalDivider />
          <SettingTextItem name={"Signer Type"} text={"local"} />
          <ViewHorizontalDivider />
          <ViewHorizontalDivider />
          <SettingTextItem name={"Owner"} text={auth.address} copiable={true} />
          <ViewHorizontalDivider />
          {scaAddress && (
            <SettingTextItem
              name={"Wallet Address"}
              text={scaAddress}
              copiable={true}
            />
          )}
        </View>
        <View style={(styles.itemGroup, { alignSelf: "center" })}>
          <TouchableOpacity
            style={styles.button}
            onPress={(): void => {
              setVisibleSignOutModal(true);
            }}
          >
            <FormText font={"SB"} color={colors.black._700}>
              Sign Out
            </FormText>
          </TouchableOpacity>
        </View>
      </View>
      <FormModal
        visible={visibleSignOutModal}
        title={"Are you sure to sign out?"}
        message="You can always sign back in."
        positive={{
          text: "Cancel",
          callback: (): void => {
            setVisibleSignOutModal(false);
          },
        }}
        negative={{
          text: "Sign out",
          callback: (): void => {
            setVisibleSignOutModal(false);
            logout();
          },
        }}
      />
    </Container>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    backgroundColor: colors.black._90005,
    flex: 1,
    rowGap: 12,
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  itemGroup: { backgroundColor: colors.white, borderRadius: 9 },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: colors.warning,
    borderColor: colors.black._100,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
});
