"use client";

/**
 * Main Page - Alchemy Account Kit + Particle Universal Accounts Demo
 *
 * This page demonstrates:
 * 1. User authentication with Alchemy Account Kit (AuthCard)
 * 2. Getting the user's EOA address for Universal Account initialization
 * 3. Rendering the Universal Account demo component
 */

import {
  useLogout,
  useSignerStatus,
  useUser,
  useAccount,
  AuthCard,
} from "@account-kit/react";
import { UniversalAccountDemo } from "./components/UniversalAccountDemo";

export default function Home() {
  // ==========================================================================
  // ALCHEMY ACCOUNT KIT HOOKS
  // ==========================================================================

  // Get the authenticated user (contains the EOA address we need)
  const user = useUser();

  // Check if the signer is still initializing
  const signerStatus = useSignerStatus();

  // Logout function
  const { logout } = useLogout();

  // Get Alchemy's Smart Contract Account (SCA) - for display only
  // Note: We don't use this for Universal Accounts, just showing it for reference
  const { address: scaAddress } = useAccount({ type: "LightAccount" });

  // ==========================================================================
  // IMPORTANT: EOA vs SCA
  // ==========================================================================
  // Alchemy Account Kit provides TWO types of addresses:
  //
  // 1. EOA (Externally Owned Account) - user.address
  //    - This is the user's actual wallet address
  //    - This is what Universal Accounts needs as the "owner"
  //    - Used to sign transactions
  //
  // 2. SCA (Smart Contract Account) - from useAccount()
  //    - This is Alchemy's smart account for gasless transactions
  //    - NOT used for Universal Accounts
  //
  // We pass the EOA to Universal Accounts because it controls the UA.
  const eoaAddress = user?.address as `0x${string}` | undefined;

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Universal Account Demo
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Alchemy Account Kit + Particle Network Universal Accounts
        </p>

        {signerStatus.isInitializing ? (
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Logged in as
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {user.email ?? "Anonymous"}
                  </p>
                  {eoaAddress && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                      EOA: {eoaAddress.slice(0, 6)}...{eoaAddress.slice(-4)}
                    </p>
                  )}
                  {scaAddress && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                      SCA: {scaAddress.slice(0, 6)}...{scaAddress.slice(-4)}
                    </p>
                  )}
                </div>
                <button
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  onClick={() => logout()}
                >
                  Log out
                </button>
              </div>
            </div>

            {/* Universal Account Demo - pass the EOA address */}
            {eoaAddress && <UniversalAccountDemo eoaAddress={eoaAddress} />}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sign in to access your Universal Account
            </p>
            {/* Auth Card - embedded login form */}
            <div className="w-full max-w-md">
              <AuthCard />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
