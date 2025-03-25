// Captures 0x + 4 characters, then the last 5 characters.
const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{5})$/;

const truncateAddress = (address: string) => {
  const match = address.match(truncateRegex);
  if (match) return `${match[1]}…${match[2]}`;
  return `${address.slice(0, 4)}...${address.slice(-5)}`;
};

export default truncateAddress;
