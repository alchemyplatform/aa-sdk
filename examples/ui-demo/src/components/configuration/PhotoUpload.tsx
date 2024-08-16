import { useConfig } from "@/app/state";
import { ChangeEvent } from "react";
import { PhotoIcon } from "../icons/photo";
import FileUploadInput from "../shared/FileUploadInput";

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
    if (!logo?.fileSrc) return;

    setConfig((prev) => ({
      ...prev,
      ui: {
        ...prev.ui,
        [mode === "dark" ? "logoDark" : "logoLight"]: undefined,
      },
    }));
    URL.revokeObjectURL(logo.fileSrc);
  };

  return (
    <div className="border-gray-300 self-start border rounded-lg py-2 px-[10px] gap-2 flex items-center justify-center hover:opacity-80 w-28 h-10">
      <div
        style={{
          backgroundImage: logo?.fileSrc ? `url(${logo.fileSrc})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {logo?.fileSrc ? null : <PhotoIcon />}
      </div>
      <div className="flex flex-col gap-[2px]">
        <div
          className={`text-xs text-gray-500 font-medium ${
            logo?.fileName ? "" : "hidden"
          }`}
        >
          {logo?.fileName ? truncatedFileName(logo.fileName) : "File name"}
        </div>
        {logo ? (
          <button
            onClick={onRemove}
            className="text-left text-sm font-semibold"
          >
            Remove
          </button>
        ) : (
          <FileUploadInput
            className="text-left text-sm font-semibold"
            onChange={onUpload}
          >
            Upload
          </FileUploadInput>
        )}
      </div>
    </div>
  );
}
