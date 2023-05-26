import ProfileScreen from "./ProfileScreen";
import NavigationBar from "../components/NavigationBar";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../clients/query";
import { ToastContainer } from "~/utils/toast";
import { WalletContext } from "~/context/Wallet";

export default function RootScreen() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <WalletContext>
          <NavigationBar />
          <ProfileScreen />
        </WalletContext>
      </ChakraProvider>
      <ToastContainer />
    </QueryClientProvider>
  );
}
