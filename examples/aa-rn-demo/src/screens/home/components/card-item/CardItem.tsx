import RNBounceable from "@freakycoder/react-native-bounceable";
import { useTheme } from "@react-navigation/native";
import React, { useMemo } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
/**
 * ? Local Imports
 */
import { type ICardItem } from "@services/models";
import createStyles from "./CardItem.style";

import FormImage from "@shared-components/atom/FormImage";
import Text from "@shared-components/text-wrapper/TextWrapper";

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>;

interface ICardItemProps {
  style?: CustomStyleProp;
  data: ICardItem;
  onPress: () => void;
}

const CardItem: React.FC<ICardItemProps> = ({ style, data, onPress }) => {
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(), []);

  const {
    title,
    description,
    media: [{ raw: image }],
  } = data;

  const Header = () => (
    <>
      <Text h4 bold color={colors.text}>
        {title}
      </Text>
      <Text h5 color={colors.placeholder} style={styles.descriptionTextStyle}>
        {description}
      </Text>
    </>
  );

  return (
    <RNBounceable style={[styles.container, style]} onPress={onPress}>
      <Header />
      <View style={styles.contentContainer}>
        <FormImage source={{ uri: image }} size={350} />
      </View>
    </RNBounceable>
  );
};

export default CardItem;
