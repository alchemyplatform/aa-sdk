import { useConfig } from "@/src/app/state";

export function ColorPicker() {
  const {
    config: {
      ui: { primaryColor },
    },
  } = useConfig();
  // TODO: add color picker library
  return (
    <button className="rounded-lg py-2 px-[10px] gap-2 flex items-center border border-gray-300 hover:opacity-80">
      <div className="h-6 w-6 rounded" style={{ backgroundColor: primaryColor }} />
      <div className="text-sm">{primaryColor}</div>
    </button>
  );
}
