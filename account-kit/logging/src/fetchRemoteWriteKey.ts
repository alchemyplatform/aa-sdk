export async function fetchRemoteWriteKey(): Promise<string | undefined> {
  try {
    const res = await fetch(
      "https://ws-accounkit-assets.s3.us-west-1.amazonaws.com/logger_config_v1.json"
    );
    const json = await res.json();
    return json.writeKey as string | undefined;
  } catch (e) {
    console.warn("failed to fetch write key");
    return undefined;
  }
}
