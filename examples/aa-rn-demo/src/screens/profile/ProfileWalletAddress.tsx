import { useAlertContext } from "@context/alert";
import Clipboard from "@react-native-clipboard/clipboard";
import FormText from "@shared-components/atom/FormText";
import Row from "@shared-components/atom/Row";
import { truncate } from "@shared-utils";
import { colors } from "@theme/color";
import React, { type ReactElement } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { type Hex } from "viem";

export type ProfileWalletAddressProps = {
  address: Hex | undefined;
};

// eslint-disable-next-line react/display-name
const ProfileWalletAddress = React.memo(
  ({ address }: ProfileWalletAddressProps): ReactElement => {
    const { dispatchAlert } = useAlertContext();
    return (
      <View style={styles.walletAddressBox}>
        {address && (
          <TouchableOpacity
            onPress={(): void => {
              if (!address) {
                return;
              }
              dispatchAlert({
                type: "open",
                alertType: "info",
                message: "Address copied",
              });
              Clipboard.setString(address);
            }}
          >
            <Row
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <FormText color={colors.black._500}>
                {truncate(address.toString(), [6, 4])}
              </FormText>
              <Icon
                name="copy"
                type={IconType.FontAwesome5}
                color={colors.black._500}
                size={14}
              />
            </Row>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

export default ProfileWalletAddress;

const styles = StyleSheet.create({
  walletAddressBox: {
    paddingTop: 6,
  },
});
