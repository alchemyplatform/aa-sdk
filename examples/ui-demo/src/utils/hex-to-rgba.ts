export function hexToRgba(hex: string, alpha = 1) {
  // Remove the hash symbol if present
  hex = hex.replace(/^#/, "");

  // Check for valid hex code length
  if (hex.length !== 3 && hex.length !== 6) {
    throw new Error("Invalid hex color code");
  }

  // Convert 3-digit hex to 6-digit hex
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Parse the r, g, b values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
