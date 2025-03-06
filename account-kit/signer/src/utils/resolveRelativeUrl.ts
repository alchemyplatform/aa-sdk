export function resolveRelativeUrl(url: string): string {
  // Funny trick.
  const a = document.createElement("a");
  a.href = url;
  return a.href;
}
