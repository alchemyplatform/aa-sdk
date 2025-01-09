export const base64UrlEncode = (
  challenge: ArrayBuffer | ArrayBufferLike,
): string => {
  return Buffer.from(challenge)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};
