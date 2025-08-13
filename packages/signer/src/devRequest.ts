// TODO: remove this and use transport instead once it's ready.
export async function dev_request(
  apiKey: string,
  path: string,
  body: unknown
): Promise<any> {
  const response = await fetch(`https://api.g.alchemy.com/signer/v1/${path}`, {
    method: "post",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (response.status !== 200) {
    throw new Error(`Failed to request ${path}`);
  }
  return response.json();
}
