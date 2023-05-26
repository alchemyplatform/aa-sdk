import NavigationBar from "../components/NavigationBar";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../clients/query";
import { ToastContainer } from "~/utils/toast";
import { WalletContext } from "~/context/Wallet";
import { OnboardingPage } from "../components/onboarding/OnboardingPage";
import { useAppState } from "~/clients/appState";
import { ProfilePage } from "~/components/profile/ProfilePage";
import { ConnectPage } from "~/components/connect/ConnectPage";
import { LoadingScreen } from "./LoadingScreen";

function LandingScreen() {
  const { state } = useAppState();
  switch (state) {
    case "HAS_SCW":
      return <ProfilePage />;
    case "NO_SCW":
      return <OnboardingPage />;
    case "UNCONNECTED":
      return <ConnectPage />;
    case "LOADING":
      return <LoadingScreen />;
  }
}

export default function RootScreen() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <WalletContext>
          <NavigationBar />
<<<<<<< HEAD
          <LandingScreen />
=======
          <ProfileScreen />
>>>>>>> 07da5f0 (feat: clean up components for profile and nft fetching)
        </WalletContext>
      </ChakraProvider>
      <ToastContainer />
    </QueryClientProvider>
  );
}
