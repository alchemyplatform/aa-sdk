export enum SimulateAssetType {
  NATIVE = "NATIVE",
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
  /**
   * Special contracts that don't follow ERC 721/1155. Currently limited to
   * CryptoKitties and CryptoPunks.
   */
  SPECIAL_NFT = "SPECIAL_NFT",
}

export enum SimulateChangeType {
  APPROVE = "APPROVE",
  TRANSFER = "TRANSFER",
}
