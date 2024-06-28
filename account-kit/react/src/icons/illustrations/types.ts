import type { SVGProps } from "react";
import type { AuthIllustrationStyle } from "../../components/auth/types";

export type IllustrationProps = JSX.IntrinsicAttributes &
  SVGProps<SVGSVGElement> & {
    illustrationStyle: AuthIllustrationStyle;
  };
