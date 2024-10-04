"use client";
import { useAuthenticate } from "../../../hooks/useAuthenticate.js";
import { GoogleIcon } from "../../../icons/google.js";
import { Button } from "../../button.js";

type Props = {
  googleAuth: boolean;
};

// Not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const SocialAuth = ({ googleAuth }: Props) => {
  const { authenticateAsync } = useAuthenticate();
  const loginWithGooglePopup = () =>
    authenticateAsync({
      type: "oauth",
      authProviderId: "google",
      mode: "popup",
    });

  return (
    googleAuth && (
      <Button
        variant="social"
        icon={<GoogleIcon />}
        onClick={loginWithGooglePopup}
      ></Button>
    )
  );
};
