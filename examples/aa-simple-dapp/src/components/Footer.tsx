"use client";
import { tokenContractAddress } from "@/config/token-contract";

export default function Footer() {
  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-[16px]">
      <FooterCard
        title={"Account Kit Docs"}
        subTitle="Check out Account Kit!"
        link={"https://accountkit.alchemy.com"}
      />
      <FooterCard
        title={"Alchemy Token"}
        subTitle="Check out the contract on Etherscan!"
        link={`https://sepolia.etherscan.io/address/${tokenContractAddress}#code`}
      />
      <FooterCard
        title={"Alchemy.com"}
        subTitle="Check out other Alchemy products!"
        link={"https://alchemy.com"}
      />
    </div>
  );
}

function FooterCard({
  title,
  subTitle,
  link,
}: {
  title: string;
  subTitle: string;
  link: string;
}) {
  return (
    <div className="card w-[384px] glass shadow-xl max-lg:w-full">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{subTitle}</p>
        <div className="card-actions justify-end">
          <a
            href={link}
            target="_blank"
            className="btn text-white bg-gradient-1 transition ease-in-out duration-500 transform hover:scale-110"
          >
            Click Here
          </a>
        </div>
      </div>
    </div>
  );
}
