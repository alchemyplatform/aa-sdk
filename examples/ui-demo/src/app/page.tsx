"use client";

import {
  AuthCard,
  AuthType,
  DemoSet,
  useAuthModal,
  useUser,
} from "@alchemy/aa-alchemy/react";
// eslint-disable-next-line import/extensions
import { ChevronRight } from "@/src/components/icons/chevron";
import { MailIcon } from "@/src/components/icons/mail";
import { Input, useLogout } from "@alchemy/aa-alchemy/react";
import { useMemo, useRef } from "react";

export default function Home() {
  // const [darkMode, setDarkMode] = useState(false)
  const sections = useMemo<AuthType[][]>(
    () => [[{ type: "email", hideButton: true }], [{ type: "passkey" }]],
    []
  );
  const errorBoundary = useRef<HTMLDivElement>(null);
  const { openAuthModal } = useAuthModal();
  const user = useUser();
  const { logout } = useLogout();

  return (
    <>
      <main className="flex min-h-screen p-24 basis-2/4 light:bg-[#F9F9F9] dark:bg-[#020617] dark:text-white justify-center">
        <div className="flex flex-col gap-8 max-w-[50%] w-full">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold">Buttons</h1>
            <div className="flex flex-row gap-6">
              <DemoSet>Primary</DemoSet>
              <DemoSet type="secondary">Secondary</DemoSet>
              <DemoSet type="social">Google</DemoSet>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold">Inputs</h1>
            <Input
              placeholder="Input"
              label="Normal Input"
              hint="This is a hint text to help user."
              iconLeft={<MailIcon />}
              iconRight={<ChevronRight className="match-input" />}
            />
            <Input
              placeholder="Input"
              label="Disabled Input"
              hint="This is a hint text to help user."
              iconLeft={<MailIcon />}
              iconRight={<ChevronRight className="match-input" />}
              disabled
            />
            <Input
              placeholder="Input"
              label="Error Input"
              iconLeft={<MailIcon />}
              iconRight={<ChevronRight className="match-input" />}
              error="There was an error"
            />
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold">Auth</h1>
            <div className="flex flex-row gap-6">
              <div className="flex flex-col gap-2">
                <div className="modal w-[368px] shadow-md">
                  {!user ? (
                    <AuthCard sections={sections} />
                  ) : (
                    <div className="flex flex-col gap-2 p-2">
                      Logged in as {user.email ?? "anon"}
                      <button
                        className="btn btn-primary"
                        onClick={() => logout()}
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
                <div
                  id="example-custom-error-boundary"
                  className="*-bg-[pink] *-p-4"
                />
              </div>
              <button className="btn btn-primary" onClick={openAuthModal}>
                Open Auth Modal
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
