export function hexToRGBA(hex: string, alpha: number): string {
  // Remove the leading '#' if present
  hex = hex.replace(/^#/, "");

  // Validate hex string
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error("Invalid hex color format");
  }

  let r: number, g: number, b: number;

  if (hex.length === 3) {
    // Expand shorthand form (#RGB to #RRGGBB)
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    // Parse the RRGGBB format
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    throw new Error("Invalid hex color length");
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
