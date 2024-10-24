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
      or: "or",
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
    error: {
      general: {
        title: "Permission denied",
        body: "The request is currently not allowed by the agent or the platform. Try again later.",
      },
      connection: {
        passkeyTitle: "Connection failed",
        passkeyBody:
          "Passkey request timed out or canceled by the agent. You may have to use another method to register a passkey for your account.",
        oauthTitle: "Couldn't connect to ",
        oauthBody: "The connection failed or canceled",
        walletTitle: "Couldn't connect to ",
        walletBody: "The wallet’s connection failed or canceled",
        timedOutTitle: "Connection timed out",
        timedOutBody: "It looks like you need more time.",
      },
      cta: {
        tryAgain: "Try again",
        useAnotherMethod: "Use another method",
      },
      customErrorMessages: {
        eoa: {
          walletConnect: {
            chainIdNotFound: {
              heading: "The connected wallet does not support this network",
              body: "The wallet connection failed.",
              tryAgainCTA: "Try again with a different wallet",
            },
          },
          default: {
            heading: "Couldn't connect to ",
            body: "The wallet's connection failed or was canceled.",
            tryAgainCTA: "Try again",
          },
        },
      },
    },
    oauthContactSupport: {
      title: "Need help?",
      body: "Contact support",
    },
  },
};

export const ls = STRINGS["en-US"];
