// TODO(jh): this doesn't even work locally w/ next.js. use some simple separate db for demo.
// Basic mock database implementation.

interface UserData {
  orgId: string;
  address: string;
  userId: string;
  email?: string;
}

/** Map from org id to user information. */
const userData = new Map<string, UserData>();

interface UserApiKey {
  publicKey: string;
  privateKey: string;
  createdAt: Date;
}

/** Map from org id to user api key pairs that can be used on the server. */
const userApiKey = new Map<string, UserApiKey[]>();

export const upsertUser = (data: UserData, apiKey: UserApiKey) => {
  userData.set(data.orgId, data);
  const existingKeys = userApiKey.get(data.orgId) ?? [];
  userApiKey.set(data.orgId, [...existingKeys, apiKey]);
};

export const getUser = (orgId: string) => {
  return userData.get(orgId) ?? null;
};

export const getLatestApiKey = (orgId: string) => {
  const keys = userApiKey.get(orgId);
  if (!keys) {
    throw new Error(`No keys found for org ${orgId}`);
  }
  return keys[keys.length - 1];
};
