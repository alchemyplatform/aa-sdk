import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

export type UseAppStateReturn = {
  appStateStatus: AppStateStatus;
  appVisibility: "foreground" | "background" | undefined;
};

export const useAppState = (): UseAppStateReturn => {
  const appState = useRef(AppState.currentState);
  const [appVisibility, setAppVisibility] = useState<
    "foreground" | "background"
  >();
  const [appStateStatus, setAppStateStatus] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (appState.current === "unknown" && nextAppState !== "unknown") {
          setAppVisibility(
            nextAppState === "active" ? "foreground" : "background",
          );
        } else if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          console.log("App has come to the foreground");
          setAppVisibility("foreground");
        } else if (
          appState.current === "active" &&
          nextAppState.match(/inactive|background/)
        ) {
          console.log("App has come to the background");
          setAppVisibility("background");
        }

        appState.current = nextAppState;
        setAppStateStatus(appState.current);
        console.log("AppState", appState.current);
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    appStateStatus,
    appVisibility,
  };
};
