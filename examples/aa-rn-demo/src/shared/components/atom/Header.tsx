import { conditionChaining } from "@shared-utils";
import { colors } from "@theme/color";
import React, { type ReactElement, type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextProps,
  type TouchableOpacityProps,
  type ViewStyle,
} from "react-native";
import Icon, { IconType } from "react-native-dynamic-vector-icons";

export type HeaderProps = {
  title?: ReactNode;
  left?: "back" | "close" | ReactElement;
  right?: "close" | ReactNode;
  onPressLeft?: () => void;
  onPressRight?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

const Header = ({
  title = "",
  left = undefined,
  right = undefined,
  onPressLeft,
  onPressRight,
  containerStyle,
}: HeaderProps): ReactElement => {
  if (left === "back") {
    left = (
      <Icon
        type={IconType.FontAwesome5}
        name="chevron-left"
        color={colors.black._900}
        size={28}
      />
    );
  } else if (left === "close") {
    left = (
      <Icon
        type={IconType.FontAwesome5}
        name="times"
        color={colors.black._900}
        size={28}
      />
    );
  }

  if (right === "close") {
    right = (
      <Icon
        type={IconType.FontAwesome5}
        name="times"
        color={colors.black._900}
        size={28}
      />
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        <LeftSide onPress={onPressLeft}>{left}</LeftSide>
        <View style={styles.title}>
          {typeof title === "string" ? (
            <HeaderTitle>{title}</HeaderTitle>
          ) : (
            title
          )}
        </View>
        <RightSide onPress={onPressRight}>{right}</RightSide>
      </View>
    </View>
  );
};

const LeftSide = ({
  onPress,
  children,
}: {
  onPress?: () => void;
  children: ReactNode;
}): ReactElement => {
  if (!children) {
    return <></>;
  }
  return (
    <View style={styles.left}>
      <HeaderButton onPress={onPress}>{children}</HeaderButton>
    </View>
  );
};

const RightSide = ({
  onPress,
  children,
}: {
  onPress?: () => void;
  children: ReactNode;
}): ReactElement => {
  if (!children) {
    return <></>;
  }
  return (
    <View style={styles.right}>
      <HeaderButton onPress={onPress}>{children}</HeaderButton>
    </View>
  );
};

const HeaderTitle = ({
  children,
  style,
  ...props
}: TextProps): ReactElement => {
  return (
    <Text
      {...props}
      numberOfLines={1}
      style={[style, { fontSize: 19, color: "black" }]}
    >
      {children}
    </Text>
  );
};

const HeaderButton = ({
  children,
  disabled,
  onPress,
  color,
  ...props
}: TouchableOpacityProps & { color?: string }): ReactElement => {
  return (
    <TouchableOpacity
      style={styles.button}
      {...props}
      disabled={!onPress || disabled}
      onPress={(e): void => onPress?.(e)}
      activeOpacity={0.7}
    >
      {conditionChaining(
        [typeof children === "string" || typeof children === "number"],
        [
          // eslint-disable-next-line react/jsx-key
          <Text numberOfLines={1} style={{ color }}>
            {children}
          </Text>,
          children,
        ],
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    height: 56,
    justifyContent: "center",
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  left: {
    height: "100%",
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  right: {
    height: "100%",
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  button: {
    padding: 4,
  },
});

export default Header;
