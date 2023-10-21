import React, { type ReactElement, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import BottomSheet from "@gorhom/bottom-sheet";
import { type BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

const FormBottomSheet = ({
  bottomSheetRef,
  children,
  showBottomSheet,
  snapPoints,
  onClose,
  backgroundStyle,
}: {
  bottomSheetRef?: React.RefObject<BottomSheetMethods>;
  children: ReactNode;
  showBottomSheet: boolean;
  snapPoints: (string | number)[];
  onClose: () => void;
  backgroundStyle?: StyleProp<ViewStyle>;
}): ReactElement => {
  return (
    <>
      {showBottomSheet && (
        <View style={styles.bottomSheetOverlay}>
          <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            enableOverDrag={false}
            enablePanDownToClose
            onClose={onClose}
            backgroundStyle={backgroundStyle}
          >
            {children}
          </BottomSheet>
        </View>
      )}
    </>
  );
};

export default FormBottomSheet;

const styles = StyleSheet.create({
  bottomSheetOverlay: {
    position: "absolute",
    backgroundColor: "#00000018",
    width: "100%",
    height: "100%",
    bottom: 0,
    zIndex: 1,
  },
});
