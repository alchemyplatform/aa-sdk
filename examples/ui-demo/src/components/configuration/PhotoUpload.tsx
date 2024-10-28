import { useConfigStore } from "@/state";
import { ChangeEvent } from "react";
import { PhotoIcon } from "../icons/photo";
import FileUploadInput from "../shared/FileUploadInput";
import { cn } from "@/lib/utils";

const sidebarButton = `self-start border rounded-lg py-2 px-[10px] gap-2 flex items-center justify-between hover:opacity-80 w-28 h-10 border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`;

export function PhotoUploads({ mode }: { mode: "dark" | "light" }) {
  const { logo, setLogo } = useConfigStore(({ ui, setLogo }) => {
    return {
      logo: ui[mode === "dark" ? "logoDark" : "logoLight"],
      setLogo,
    };
  });

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length < 1) return;

    const file = e.target.files[0];
    setLogo(mode === "dark" ? "logoDark" : "logoLight", {
      fileName: file.name,
      fileSrc: URL.createObjectURL(file),
    });
  };

  const onRemove = () => {
    if (!logo?.fileSrc) return;

    setLogo(mode === "dark" ? "logoDark" : "logoLight", undefined);
    URL.revokeObjectURL(logo.fileSrc);
  };

  return (
    <>
      {logo ? (
        <button
          onClick={onRemove}
          className={cn(sidebarButton, "justify-center")}
          id="logo-remove"
        >
          Remove
        </button>
      ) : (
        <FileUploadInput
          className={sidebarButton}
          onChange={onUpload}
          id="logo-upload"
        >
          <PhotoIcon />
          <span className="text-sm">Upload</span>
        </FileUploadInput>
      )}
    </>
  );
}
