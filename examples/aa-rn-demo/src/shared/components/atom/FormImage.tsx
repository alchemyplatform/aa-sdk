import React, { type ReactElement } from "react";
import FastImage, { type FastImageProps } from "react-native-fast-image";

type FormImageProps = {
  width?: number;
  height?: number;
  size?: number;
} & FastImageProps;
const FormImage = (props: FormImageProps): ReactElement => {
  const { size, style, width, height, ...rest } = props;

  return (
    <FastImage
      style={[{ width: width ?? size, height: height ?? size }, style]}
      {...rest}
    />
  );
};

export default FormImage;
