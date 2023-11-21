"use client";
import Image from "next/image";

export default function Hero() {
  return (
    <div className="flex flex-row items-center gap-[64px] max-md:flex-col max-md:text-center">
      <Image
        src="/kit-logo.svg"
        alt="Account Kit Token"
        width={400}
        height={400}
        priority
      />
      <div className="flex flex-col items-start gap-[48px] max-md:items-center">
        <div className="flex flex-col flex-wrap gap-[12px]">
          <div className="flex flex-row max-md:justify-center">
            <a
              href="https://accountkit.alchemy.com"
              target="_blank"
              className="btn bg-black dark:bg-white text-white dark:text-black transition ease-in-out duration-500 transform hover:scale-110 hover:bg-black hover:dark:bg-white"
            >
              <Image
                src="/kit-logo.svg"
                alt="Account Kit Logo"
                width={28}
                height={28}
                priority
              />
              <div className="text-md">Powered By Account Kit</div>
            </a>
          </div>
          <div className="text-5xl font-bold">Account Kit Token</div>
        </div>
      </div>
    </div>
  );
}
