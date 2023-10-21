import React, { type ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import FormText from "./FormText";
import HyperlinkText from "./HyperlinkText";

type DotListItemTextProps =
  | {
      text: string;
    }
  | {
      startText: string;
      linkText: string;
      linkUrl: string;
      endText: string;
    };

const DotListItemText = (props: DotListItemTextProps): ReactElement => {
  return (
    <View style={styles.listItemContainer}>
      <FormText style={styles.dot}>·</FormText>
      {"text" in props ? (
        <FormText style={styles.listItem}>{props.text}</FormText>
      ) : (
        <View style={styles.listItem}>
          <FormText>{props.startText}</FormText>
          <HyperlinkText text={props.linkText} url={props.linkUrl} />
          <FormText>{props.endText}</FormText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listItemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  dot: {
    width: 10,
  },
  listItem: {
    flex: 1,
  },
});

export default DotListItemText;
