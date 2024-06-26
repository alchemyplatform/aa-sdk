// copied from aa-sdk values:
// https://github.com/alchemyplatform/aa-sdk/blob/v4.x.x/account-kit/react/src/tailwind/components/border-vars.ts#L4
export function getBorderRadiusValue(borderRadius: 'none' | 'sm' | 'md' | 'lg') {
  switch (borderRadius) {
    case "lg":
      return "24px";
    case "md":
      return "16px";
    case "none":
      return "0px";
    case "sm":
    default:
      return "8px";
    }
}