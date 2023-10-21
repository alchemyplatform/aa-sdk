// @flow

import { truncate } from "@shared-utils";
import React, { useEffect, useState, type ReactElement } from "react";
import {
  Platform,
  View,
  type ImageURISource,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { type ImageStyle } from "react-native-fast-image";
import { WebView } from "react-native-webview";
import { v4 as uuidv4 } from "uuid";

const heightUnits = Platform.OS === "ios" ? "vh" : "%";

const getHTML = (svgContent: string, style?: ImageStyle): string => `
<html data-key="key-${uuidv4()}">
  <head>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        position: fixed;
        top: 0;
        left: 0;
        height: 100${heightUnits};
        width: 100${heightUnits};
        overflow: hidden;
        background-color: transparent;
        object-fit: contain;
      }
      svg {
        width: ${
          typeof style?.width === "number"
            ? `${style.width}px`
            : style?.width ?? "100%"
        };
        height: ${
          typeof style?.height === "number"
            ? `${style.height}px`
            : style?.height ?? "100%"
        };
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    ${svgContent}
  </body>
</html>
`;

export type SvgImageImageProps = {
  source: ImageURISource;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onError?: (error: any) => void;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

function SvgImage({
  source,
  onLoadStart,
  onLoadEnd,
  onError,
  style,
  containerStyle,
}: SvgImageImageProps): ReactElement {
  const [svgContent, setSvgContent] = useState<string | null>(null);

  const uri = source && source.uri;
  useEffect(() => {
    const controller = new AbortController();

    async function doFetch(): Promise<void> {
      if (uri) {
        onLoadStart && onLoadStart();
        const index = uri.indexOf("<svg");
        if (index !== -1) {
          setSvgContent(uri.slice(index));
        } else {
          try {
            const res = await fetch(uri);
            const text = await res.text();
            setSvgContent(text);
          } catch (err) {
            console.error("[WebviewSvgImage]:", truncate(uri, [100, 10]), err);
            onError && onError(err);
          }
        }
        onLoadEnd && onLoadEnd();
      }
    }

    doFetch();

    return (): void => {
      controller.abort();
    };
  }, [onError, onLoadEnd, onLoadStart, uri]);

  if (svgContent) {
    const html = getHTML(svgContent, (style ?? {}) as ImageStyle);

    return (
      <View
        pointerEvents="none"
        style={[style, containerStyle]}
        renderToHardwareTextureAndroid={true}
      >
        <WebView
          originWhitelist={["*"]}
          scalesPageToFit={true}
          useWebKit={false}
          style={style}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          source={{ html }}
        />
      </View>
    );
  } else {
    return <View pointerEvents="none" style={[containerStyle, style]} />;
  }
}

export default SvgImage;
