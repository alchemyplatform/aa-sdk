const key = (address: string, chainId: number) =>
  `smartContractAccount-${address}-${chainId}`;

const smartAccountAddresses = (address: string, chainId: number) => {
  const scAddresses = JSON.parse(
    localStorage.getItem(key(address, chainId)) ?? "[]"
  );
  return scAddresses;
};

const addSmartContractAccount = (
  address: string,
  scAddress: string,
  chainId: number
) => {
  const k = key(address, chainId);
  const addresses = JSON.parse(localStorage.getItem(k) ?? "[]");
  localStorage.setItem(k, JSON.stringify([...addresses, scAddress]));
};

const removeSmartContractAccount = (
  address: string,
  scAddress: string,
  chainId: number
) => {
  const k = key(address, chainId);
  const scAddresses = JSON.parse(localStorage.getItem(k) ?? "[]");
  if (!scAddresses.includes(scAddress)) {
    scAddresses.splice(scAddresses.indexOf(scAddress), 1);
    localStorage.setItem(k, JSON.stringify([...scAddresses, scAddress]));
  }
};

export const localSmartContractStore = {
  smartAccountAddresses,
  addSmartContractAccount,
  removeSmartContractAccount,
};
