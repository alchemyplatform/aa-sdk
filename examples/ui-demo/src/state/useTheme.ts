import { useConfigStore } from ".";

export function useTheme() {
  const { theme } = useConfigStore(({ ui: { theme } }) => ({ theme }));

  return theme;
}
