const STRINGS = {
  "en-US": {
    login: {
      tosPrefix: "By signing in, you agree to the",
      tosLink: "Terms of Service",
      email: {
        placeholder: "Email",
        button: "Continue",
      },
      passkey: {
        button: "I have a passkey",
      },
    },
    addPasskey: {
      title: "Add a passkey",
      continue: "Continue",
      skip: "Skip",
      simplerLoginTitle: "Simpler login",
      simplerLoginDescription:
        "Create a passkey to enable quick and easy login with Face ID or Touch ID.",
      enhancedSecurityTitle: "Enhanced security",
      enhancedSecurityDescription:
        "Prevent phishing and theft by registering a passkey with your device.",
    },
    loadingEmail: {
      title: "Check your email",
      verificationSent: "We sent a verification link to",
      emailNotReceived: "Didn't receive the email?",
      resend: "Resend",
      resent: "Done!",
    },
    completingEmail: {
      body: "Your email verification is almost complete. Please wait a few seconds for this to screen to update.",
    },
    loadingPasskey: {
      title: "Continue with passkey",
      body: "Follow the prompt to verify your passkey.",
      supportText: "Having trouble?",
      supportLink: "Contact support",
    },
    poweredBy: {
      title: "powered by",
    },
  },
};

export const ls = STRINGS["en-US"];
