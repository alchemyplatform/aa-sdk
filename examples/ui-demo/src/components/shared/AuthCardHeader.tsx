import { Config } from "@/app/config";

export function AuthCardHeader({
  logoDark,
  logoLight,
  theme,
}: Pick<Config["ui"], "theme" | "logoLight" | "logoDark">) {
  const logo = theme === "dark" ? logoDark : logoLight;

  if (!logo) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      style={{ height: "60px", objectFit: "cover", objectPosition: "center" }}
      src={logo.fileSrc}
      alt={logo.fileName}
    />
  );
}
