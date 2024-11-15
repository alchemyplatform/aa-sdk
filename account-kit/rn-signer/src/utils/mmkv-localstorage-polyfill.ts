import { MMKV } from "react-native-mmkv";

class MMKVLocalStorage {
  private storage;
  constructor() {
    this.storage = new MMKV({ id: "mmkv-localstorage" });
  }

  // implement the Storage interface
  getItem(key: string) {
    return this.storage.getString(key) ?? null;
  }

  setItem(key: string, value: string) {
    return this.storage.set(key, value);
  }

  removeItem(key: string) {
    if (this.storage.contains(key)) {
      this.storage.delete(key);
    }
  }

  clear() {
    this.storage.clearAll();
  }

  get length() {
    return this.storage.getAllKeys().length;
  }

  key(index: number) {
    const keys = this.storage.getAllKeys();
    return keys[index] || null;
  }
}

if (!global.localStorage) {
  const mmkvLocalStorage = new MMKVLocalStorage();
  global.localStorage = mmkvLocalStorage;
}
