import { Navigate, Route, Routes } from "react-router-dom";
import ProfileScreen from "./ProfileScreen";
import NavigationBar from "../components/NavigationBar";
import ProfileRedirect from "../components/profile/ProfileRedirect";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../clients/query";
import { ToastContainer } from "~/utils/toast";
import { BrowserRouter } from "react-router-dom";

export default function RootScreen() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <NavigationBar />
          <Routes>
            <Route path="/" element={<Navigate to="profile" />} />
            <Route path="profile" element={<ProfileRedirect />} />
            <Route path="profile/:address" element={<ProfileScreen />} />
          </Routes>
        </ChakraProvider>
      </QueryClientProvider>
      <ToastContainer />
    </BrowserRouter>
  );
}
