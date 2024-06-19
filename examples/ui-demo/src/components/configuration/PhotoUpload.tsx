import { useConfig } from "@/src/app/state";
import { PhotoIcon } from "../icons/photo";
import FileUploadInput from "../shared/FileUploadInput";
import { ChangeEvent } from "react";

const LENGTH = 10;
function truncatedFileName(name: string) {
  if (name.length < LENGTH) return name;

  return `${name.slice(0, LENGTH - 2)}...`;
}

export function PhotoUploads({ mode }: { mode: "dark" | "light" }) {
  const { config, setConfig } = useConfig();

  const logo = mode === "dark" ? config.ui.logoDark : config.ui.logoLight;

  const onUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length < 1) return;

    const file = e.target.files[0];
    setConfig((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        [mode === "dark" ? "logoDark" : "logoLight"]: {
          fileName: file.name,
          fileSrc: URL.createObjectURL(file),
        },
      },
    }));
  };

  const onRemove = () => {
    if (!logo?.fileSrc) return 
  
    setConfig((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        [mode === "dark" ? "logoDark" : "logoLight"]: undefined,
      },
    }));
    URL.revokeObjectURL(logo.fileSrc)
  }

  return (
    <div className="flex gap-3 flex-1 basis-0">
      <div
        className={`flex items-center justify-center h-[56px] w-[56px] rounded-xl ${
          mode === "light" ? "bg-gray-100" : "bg-gray-500"
        }`}
        style={{
          backgroundImage: logo?.fileSrc ? `url(${logo.fileSrc})` : undefined,
          backgroundSize: "cover",
        }}
      >
        {logo?.fileSrc ? null : (
          <PhotoIcon color={mode === "dark" ? "white" : undefined} />
        )}
      </div>
      <div className="flex flex-col gap-[2px]">
        <div className="text-secondary text-xs font-semibold">
          {mode === "light" ? "Light" : "Dark"} mode
        </div>
        <div className="text-xs text-gray-500 font-medium">
          {logo?.fileName ? truncatedFileName(logo.fileName) : "File name"}
        </div>
        {logo ? (
          <button onClick={onRemove} className="text-left text-blue-600 text-xs font-semibold">Remove</button>
        ) : (
          <FileUploadInput
            className="text-left text-blue-600 text-xs font-semibold"
            onChange={onUpload}
          >
            Upload
          </FileUploadInput>
        )}
      </div>
    </div>
  );
}
