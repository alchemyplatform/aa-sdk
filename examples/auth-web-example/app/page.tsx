"use client";
import { AuthSession } from "@alchemy/auth";
import { createWebAuthClient } from "@alchemy/auth-web";
import { ReactElement, useCallback, useEffect, useState } from "react";

const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_ALCHEMY_API_KEY is not set");
}

const authClient = createWebAuthClient({ apiKey });

export default function Home(): ReactElement {
  const [email, setEmail] = useState("");
  const [hasSentEmail, setHasSentEmail] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

<<<<<<< HEAD
<<<<<<< HEAD
  useEffect(() => {
    authClient.handleOauthRedirect().then((authSession) => {
      setAuthSession(authSession);
=======
  useEffect(() => {
    authClient.handleOauthRedirect().then((signer) => {
      setSigner(signer);
>>>>>>> 2b9063d6 (chore: restore oauth changes)
    });
  }, []);

  const handleOauthLogin = useCallback(async () => {
    console.log("Logging in with OAuth...");
    await authClient.loginWithOauth({
      type: "oauth",
      authProviderId: "google",
      mode: "redirect",
    });
    console.log("do we ever get here?");
  }, []);

<<<<<<< HEAD
=======
>>>>>>> 3ecc047e (feat(signer): end-to-end email otp with new signer)
=======
>>>>>>> 2b9063d6 (chore: restore oauth changes)
  const handleSendEmailOtp = useCallback(async () => {
    await authClient.sendEmailOtp({ email });
    setHasSentEmail(true);
  }, [email]);

  const handleSubmitOtpCode = useCallback(async () => {
<<<<<<< HEAD
    const authSession = await authClient.submitOtpCode({ otpCode });
    setAuthSession(authSession);
  }, [otpCode]);
=======
    const signer = await authClient.submitOtpCode({ otpCode });
    setSigner(signer);
<<<<<<< HEAD
  }, [authClient, otpCode]);
>>>>>>> 3ecc047e (feat(signer): end-to-end email otp with new signer)
=======
  }, [otpCode]);
>>>>>>> 2b9063d6 (chore: restore oauth changes)

  const handleDisconnect = useCallback(async () => {
    authSession?.disconnect();
    setEmail("");
    setHasSentEmail(false);
    setOtpCode("");
    setAuthSession(null);
    setSignature(null);
  }, [authSession]);

  const handleSign = useCallback(async () => {
    if (!authSession) {
      // Should never happen.
      throw new Error("Cannot sign without an auth session");
    }
    const signature = await authSession.signMessage({ message: "out" });
    setSignature(signature);
  }, [authSession]);

  function renderEnterEmail() {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-base-200">
        <div className="flex flex-col gap-4 p-8 rounded-lg shadow-lg bg-base-100">
          <p>Enter your email to sign in</p>
          <input
            type="email"
            placeholder="gbelson@hooli.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
          <button
            onClick={handleSendEmailOtp}
            disabled={!looksLikeEmail(email)}
            className="btn btn-primary w-full"
          >
            Sign in
          </button>
          <button
            onClick={handleOauthLogin}
            className="btn btn-secondary w-full"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  function renderEnterOtpCode() {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-base-200">
        <div className="flex flex-col gap-4 p-8 mt-6 rounded-lg shadow-lg bg-base-100">
          <p>Enter the code sent to {email}</p>
          <input
            type="text"
            placeholder="123456"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
          <button
            onClick={handleSubmitOtpCode}
            disabled={!looksLikeOtpCode(otpCode)}
            className="btn btn-success w-full"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  function renderLoggedIn() {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-base-200">
        <div className="flex flex-col gap-4 p-8 rounded-lg shadow-lg bg-base-100 items-center">
          <div className="alert alert-success w-full max-w-md flex flex-col items-center text-center">
            <p>Logged in as {authSession!.user.email}</p>
            <p>Your address: {authSession!.user.address}</p>
          </div>
          {signature && (
            <div className="alert alert-success w-full max-w-md flex flex-col">
              <p>Signed message &quot;out&quot;:</p>
              <p className="break-all">{signature}</p>
            </div>
          )}
          <button
            onClick={handleDisconnect}
            className="btn btn-error w-full max-w-xs"
          >
            Sign out
          </button>
          <button
            onClick={handleSign}
            className="btn btn-primary w-full max-w-xs"
          >
            Sign &quot;out&quot;
          </button>
        </div>
      </div>
    );
  }

  if (authSession) {
    return renderLoggedIn();
  } else if (hasSentEmail) {
    return renderEnterOtpCode();
  } else {
    return renderEnterEmail();
  }
}

function looksLikeEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function looksLikeOtpCode(s: string): boolean {
  return /^[0-9]{6}$/.test(s);
}
