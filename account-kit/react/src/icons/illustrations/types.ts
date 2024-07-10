import type { SVGProps } from "react";
import type { AuthIllustrationStyle } from "../../types.js";

export type IllustrationProps = JSX.IntrinsicAttributes &
  SVGProps<SVGSVGElement> & {
    illustrationStyle: AuthIllustrationStyle;
  };
