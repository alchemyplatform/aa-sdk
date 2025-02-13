import { useTheme } from "@/state/useTheme";
export const LoadingIcon = () => {
  const theme = useTheme();
  const animationClass =
    theme === "dark" ? "animate-ui-loading-dark" : "animate-ui-loading-light";

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className={animationClass}
        cx="4"
        cy="24"
        r="4"
        style={{ animationDelay: "200ms" }}
      ></circle>
      <circle
        className={animationClass}
        cx="44"
        cy="24"
        r="4"
        style={{ animationDelay: "600ms" }}
      ></circle>
      <circle
        className={animationClass}
        cx="24"
        cy="4"
        r="4"
        style={{ animationDelay: "400ms" }}
      ></circle>
      <circle
        className={animationClass}
        cx="24"
        cy="44"
        r="4"
        style={{ animationDelay: "0ms" }}
      ></circle>
      <circle
        className={animationClass}
        cx="38.1421"
        cy="9.85784"
        r="4"
        transform="rotate(45 38.1421 9.85784)"
        style={{ animationDelay: "500ms" }}
      ></circle>
      <circle
        className={animationClass}
        cx="9.85791"
        cy="38.1421"
        r="4"
        transform="rotate(45 9.85791 38.1421)"
        style={{ animationDelay: "100ms" }}
      ></circle>
      <circle
        className={animationClass}
        cx="38.142"
        cy="38.1421"
        r="4"
        transform="rotate(135 38.142 38.1421)"
        style={{ animationDelay: "700ms" }}
      ></circle>
      <circle
        className={animationClass}
        cx="9.85779"
        cy="9.85785"
        r="4"
        transform="rotate(135 9.85779 9.85785)"
        style={{ animationDelay: "300ms" }}
      ></circle>
    </svg>
  );
};
