import { ProfilePage } from "../components/profile/ProfilePage";
import { OnboardingPage } from "../components/onboarding/OnboardingPage";
import { useAccount } from "wagmi";

export default function ProfileScreen() {
  const { address, isConnected } = useAccount();

  // Show onboarding if is current user
  if (!isConnected) {
    return <OnboardingPage />;
  } else {
    return <ProfilePage address={address!} />;
  }
}
