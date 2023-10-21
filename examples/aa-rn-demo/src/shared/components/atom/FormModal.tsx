import React, { type ReactElement } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  type ModalProps,
} from "react-native";

import { colors } from "@theme/color";
import FormText from "./FormText";

type ModalButtonProps = {
  text: string;
  callback: () => void;
};

const FormModal = (
  props: ModalProps & {
    title: string;
    message: string;
    positive?: ModalButtonProps;
    negative?: ModalButtonProps;
  },
): ReactElement => {
  const { title, message, positive, negative, ...rest } = props;

  return (
    <Modal {...rest} transparent>
      <View style={styles.container}>
        <View style={styles.body}>
          <FormText
            font="B"
            size={20}
            color={colors.black._900}
            style={{ marginVertical: 16 }}
          >
            {title}
          </FormText>
          <FormText color={colors.black._400} style={{ marginBottom: 44 }}>
            {message}
          </FormText>
          <View style={styles.buttonContainer}>
            {negative && (
              <View style={{ flex: 2 }}>
                <TouchableOpacity
                  style={styles.negativeButton}
                  onPress={negative.callback}
                >
                  <FormText font="SB" size={16} color={colors.primary._400}>
                    {negative?.text}
                  </FormText>
                </TouchableOpacity>
              </View>
            )}
            {positive && (
              <View style={{ flex: 3 }}>
                <TouchableOpacity
                  style={styles.positiveButton}
                  onPress={positive.callback}
                >
                  <FormText font="SB" size={16} color={colors.white}>
                    {positive?.text}
                  </FormText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: `${colors.black._900}${colors.opacity._30}`,
  },
  body: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  negativeButton: {
    backgroundColor: colors.white,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary._400,
  },
  positiveButton: {
    backgroundColor: colors.primary._400,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
});

export default FormModal;
