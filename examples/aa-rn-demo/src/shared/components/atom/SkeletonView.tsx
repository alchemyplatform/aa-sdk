import { colors } from "@theme/color";
import React, { type ReactElement } from "react";
import { Animated, Easing } from "react-native";

/**
 * SkeletonView
 * Displays a skeleton view with a shimmering effect to indicate loading.
 * @param props.height - The height of the skeleton view.
 * @param props.borderRadius - The border radius of the skeleton view.
 * @returns Component
 * @example
 * ```tsx
 * <SkeletonView height={40} borderRadius={14} />
 * ```
 */
const SkeletonView = (props: {
  width?: number;
  height?: number;
  borderRadius?: number;
}): ReactElement => {
  const animation = new Animated.Value(0);
  const startColor = `${colors.white}`;
  const endColor = `${colors.black._10}`;

  Animated.loop(
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(animation, {
        toValue: 0,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]),
  ).start();

  const backgroundColor = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [startColor, endColor, startColor],
  });

  return (
    <Animated.View
      style={{
        borderRadius: props.borderRadius,
        backgroundColor: backgroundColor,
        width: props.width,
        height: props.height,
      }}
    />
  );
};

export default SkeletonView;
