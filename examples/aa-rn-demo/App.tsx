import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import React, { useEffect } from "react";
import { LogBox, StatusBar, useColorScheme } from "react-native";
import BootSplash from "react-native-bootsplash";
import { GestureHandlerRootView } from "react-native-gesture-handler";
/**
 * ? Local Imports
 */
import { AlertProvider } from "@context/alert";
import { Compose } from "@context/global";
import { WalletProvider } from "@context/wallet";
import { isAndroid } from "@freakycoder/react-native-helpers";
import PostTxResult from "@shared-components/molecule/PostTxResult";
import Snackbar from "@shared-components/notification/SnackBar";
import { ThemeProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "react-query";
import { RecoilRoot } from "recoil";
import Navigation from "./src/navigation";

LogBox.ignoreAllLogs();

const queryClient = new QueryClient();

const App = () => {
  const scheme = useColorScheme();
  const isDarkMode = scheme === "dark";

  useEffect(() => {
    const init = async () => {
      StatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content");
      if (isAndroid) {
        StatusBar.setBackgroundColor("rgba(0,0,0,0)");
        StatusBar.setTranslucent(true);
      }
    };

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
    });
  }, [scheme, isDarkMode]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <Compose
            components={[
              SafeAreaProvider,
              AlertProvider,
              ThemeProvider,
              WalletProvider,
              BottomSheetModalProvider,
            ]}
          >
            <Navigation />
            <Snackbar />
            <PostTxResult />
          </Compose>
        </QueryClientProvider>
      </RecoilRoot>
    </GestureHandlerRootView>
  );
};

export default App;
