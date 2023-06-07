import { type NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";

const RootScreen = dynamic(
  () => {
    return import("~/surfaces/root/RootScreen");
  },
  { ssr: false }
);

const Root: NextPage = () => {
  return (
    <>
      <Head>
        <title>Alchemy D-🅰️-🅰️-PP</title>
        <meta name="description" content="Alchemy D🅰️🅰️pp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <RootScreen />
      </main>
    </>
  );
};

export default Root;
