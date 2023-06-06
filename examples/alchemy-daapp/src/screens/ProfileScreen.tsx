import {ProfilePage} from "../components/profile/ProfilePage";
import {OnboardingPage} from "../components/onboarding/OnboardingPage";
import {useAddress} from "../context/address";

export default function ProfileScreen() {
  const {address, hasAddress} = useAddress();

  // Show onboarding if is current user
  if (!hasAddress) {
    return <OnboardingPage />;
  } else {
    return <ProfilePage address={address} />;
  }
}
