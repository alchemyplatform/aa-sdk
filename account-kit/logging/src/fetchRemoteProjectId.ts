export async function fetchRemoteProjectId(): Promise<string | undefined> {
  // TODO(jh): once we have a new project id, add it to s3 instead of using this overrride.
  return "1043436688";
  // try {
  //   const res = await fetch(
  //     "https://ws-accounkit-assets.s3.us-west-1.amazonaws.com/logger_config_v1.json",
  //   );
  //   const json = await res.json();
  //   return json.writeKey as string | undefined;
  // } catch (_err) {
  //   console.warn("failed to fetch write key");
  //   return undefined;
  // }
}
