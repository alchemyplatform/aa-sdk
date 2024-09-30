import { useAuthModal } from "@account-kit/react";
import Image from "next/image";

export function MobileSplashPage() {
	const {openAuthModal} = useAuthModal();
	return (
		<div className="flex flex-col flex-1 pb-5">
			{/* Header Text */}
			<div>
				<p className="text-[44px] leading-[54px]  font-semibold tracking-tight text-fg-primary">
					Seamless signup with{" "}
					<span
						className="whitespace-nowrap"
						style={{
							background:
								"linear-gradient(126deg, #36BEFF 4.59%, #733FF1 108.32%)",
							WebkitBackgroundClip: "text",
							backgroundClip: "text",
							WebkitTextFillColor: "transparent",
						}}
					>
						smart wallets
					</span>
				</p>
				<p className="text-2xl text-fg-secondary font-semibold tracking-tight leading-10">
					Experience the demo
				</p>
			</div>
			{/* Image Wrapper */}
			<div className="w-full relative h-auto mt-[55px] flex-grow">
				{/* Placeholder - Design would provide the actual asset here. */}
				<Image
					src="/images/ui-demo-mobile-splash.png"
					alt="Mobile Splash"
					className="object-contain"
					layout="responsive"
					width={396} // <--- Width of original image
					height={389} // <--- Height of original image
				/>
			</div>

			<div className="mt-auto">
				{/* Bottom action buttons */}
				<div className="flex flex-col sm:flex-row">
					<button className="btn btn-primary w-full sm:w-auto mb-2 sm:mb-0 flex-1 m-0 sm:mr-2" onClick={()=>{
						console.log("openAuthModal")
						openAuthModal()
					}}>
						Try it
					</button>
					<a href="https://accountkit.alchemy.com/" target="_blank" className="btn btn-secondary w-full sm:w-auto flex-1 m-0 sm:ml-2">
						View docs
					</a>
				</div>
				<div className="mt-6 flex justify-center">
					<span className="text-sm text-center block">
						Visit desktop site to customize styles and auth methods
					</span>
				</div>
			</div>
		</div>
	);
}
