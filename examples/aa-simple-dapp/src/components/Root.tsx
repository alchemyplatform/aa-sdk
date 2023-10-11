import Footer from "./Footer";
import Hero from "./Hero";
import Navbar from "./Navbar";

export default function Root() {
  return (
    <div className="flex flex-col text-black dark:text-white items-center justify-between p-[96px] gap-[72px]">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  );
}
