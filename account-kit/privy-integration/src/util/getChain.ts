import {
  arbitrum,
  arbitrumGoerli,
  arbitrumNova,
  arbitrumSepolia,
  base,
  baseGoerli,
  baseSepolia,
  fraxtal,
  fraxtalSepolia,
  goerli,
  mainnet,
  optimism,
  optimismGoerli,
  optimismSepolia,
  polygon,
  polygonAmoy,
  polygonMumbai,
  sepolia,
  shape,
  shapeSepolia,
  worldChain,
  worldChainSepolia,
  zora,
  zoraSepolia,
  beraChainBartio,
  opbnbMainnet,
  opbnbTestnet,
  soneiumMinato,
  soneiumMainnet,
  unichainMainnet,
  unichainSepolia,
  inkMainnet,
  inkSepolia,
  mekong,
  monadTestnet,
  openlootSepolia,
  gensynTestnet,
  riseTestnet,
  storyMainnet,
  storyAeneid,
  celoSepolia,
  celoMainnet,
  teaSepolia,
  bobaSepolia,
  bobaMainnet,
} from "@account-kit/infra";

export function getChain(chainId: number) {
  switch (chainId) {
    case sepolia.id:
      return sepolia;
    case mainnet.id:
      return mainnet;
    case arbitrum.id:
      return arbitrum;
    case arbitrumGoerli.id:
      return arbitrumGoerli;
    case arbitrumNova.id:
      return arbitrumNova;
    case arbitrumSepolia.id:
      return arbitrumSepolia;
    case base.id:
      return base;
    case baseGoerli.id:
      return baseGoerli;
    case baseSepolia.id:
      return baseSepolia;
    case fraxtal.id:
      return fraxtal;
    case fraxtalSepolia.id:
      return fraxtalSepolia;
    case goerli.id:
      return goerli;
    case optimism.id:
      return optimism;
    case optimismGoerli.id:
      return optimismGoerli;
    case optimismSepolia.id:
      return optimismSepolia;
    case polygon.id:
      return polygon;
    case polygonAmoy.id:
      return polygonAmoy;
    case polygonMumbai.id:
      return polygonMumbai;
    case shape.id:
      return shape;
    case shapeSepolia.id:
      return shapeSepolia;
    case worldChain.id:
      return worldChain;
    case worldChainSepolia.id:
      return worldChainSepolia;
    case zora.id:
      return zora;
    case zoraSepolia.id:
      return zoraSepolia;
    case beraChainBartio.id:
      return beraChainBartio;
    case opbnbMainnet.id:
      return opbnbMainnet;
    case opbnbTestnet.id:
      return opbnbTestnet;
    case soneiumMinato.id:
      return soneiumMinato;
    case soneiumMainnet.id:
      return soneiumMainnet;
    case unichainMainnet.id:
      return unichainMainnet;
    case unichainSepolia.id:
      return unichainSepolia;
    case inkMainnet.id:
      return inkMainnet;
    case inkSepolia.id:
      return inkSepolia;
    case mekong.id:
      return mekong;
    case monadTestnet.id:
      return monadTestnet;
    case openlootSepolia.id:
      return openlootSepolia;
    case gensynTestnet.id:
      return gensynTestnet;
    case riseTestnet.id:
      return riseTestnet;
    case storyMainnet.id:
      return storyMainnet;
    case storyAeneid.id:
      return storyAeneid;
    case celoSepolia.id:
      return celoSepolia;
    case celoMainnet.id:
      return celoMainnet;
    case teaSepolia.id:
      return teaSepolia;
    case bobaSepolia.id:
      return bobaSepolia;
    case bobaMainnet.id:
      return bobaMainnet;

    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}
