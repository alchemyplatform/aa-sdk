export async function fetchRemoteWriteKey(): Promise<string | undefined> {
  try {
    const json = await fetch(
      "https://static.alchemyapi.io/assets/accountkit/logger_config.json",
      {
        headers: {
          ContentType: "application/json",
        },
        mode: "no-cors",
      }
    ).then((res) => res.json());

    return json.writeKey as string | undefined;
  } catch (e) {
    console.warn("failed to fetch write key");
    return undefined;
  }
}
