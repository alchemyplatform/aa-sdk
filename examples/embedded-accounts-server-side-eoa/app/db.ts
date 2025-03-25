// Basic mock database implementation that simplify reads and writes from json files.
// Should be replaced by a real database.

import fs from "fs";
import path from "path";

const userDataPath = path.join(process.cwd(), "./temp-data/userData.json");
const apiKeyPath = path.join(process.cwd(), "./temp-data/userApiKey.json");

const readJson = (filePath: string): any => {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const fileData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileData);
};

const writeJson = (filePath: string, data: any) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

interface UserData {
  orgId: string;
  address: string;
  userId: string;
  email?: string;
}

interface UserApiKey {
  publicKey: string;
  privateKey: string;
  createdAt: Date;
}

/**
 * Upsert a user's data and their API key.
 *
 * Reads the current database from disk, updates the data,
 * and writes the new state back to disk.
 */
export const upsertUser = (data: UserData, apiKey: UserApiKey) => {
  // Read from disk.
  const usersData = readJson(userDataPath);
  const apiKeyData = readJson(apiKeyPath);

  // Update data.
  usersData[data.orgId] = data;
  const existingKeys = apiKeyData[data.orgId] || [];
  apiKeyData[data.orgId] = [...existingKeys, apiKey];

  // Write back to disk.
  writeJson(userDataPath, usersData);
  writeJson(apiKeyPath, apiKeyData);
};

/**
 * Retrieve user data for a given organization id.
 */
export const getUser = (orgId: string): UserData | null => {
  const userData = readJson(userDataPath);
  return userData[orgId] ?? null;
};

/**
 * Get the latest API key for a given organization id.
 */
export const getLatestApiKey = (orgId: string): UserApiKey => {
  const apiKeyData = readJson(apiKeyPath);
  const keys: UserApiKey[] = apiKeyData[orgId];
  if (!keys || keys.length === 0) {
    throw new Error(`No keys found for org ${orgId}`);
  }
  return keys[keys.length - 1];
};
