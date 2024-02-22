---
outline: deep
head:
  - - meta
    - property: og:title
      content: Gas benchmarks
  - - meta
    - name: description
      content: Gas benchmarks for Alchemy Accounts
  - - meta
    - property: og:description
      content: Gas benchmarks for Alchemy Accounts
---

# Account [gas benchmarks](https://github.com/alchemyplatform/aa-benchmarks)

Modular Account provides best-in-class end-user costs on Ethereum Rollups, including Arbitrum, Base, and Optimism. As we continue to push for the [three core transitions](https://vitalik.eth.limo/general/2023/06/09/three_transitions.html) required to onboard mainstream users on-chain, Modular Account aims to provide a fundamental primitive optimized for a rollup-centric future.

Specifically, it often sacrifices call data usage for increased execution costs as to provide end users with cheaper experiences. Additionally, as a durable user account, Modular Accounts contain guardrails for permissionless interoperable usage, extending beyond the per-app embedded account paradigm that is popular today to help drive forward an invisible and interoperable future. The account is heavily optimized for day-to-day usage, with certain security features adding some execution overhead at deployment time.

Alternatively, Light Account is an account that sacrifices modularity to save on execution costs, which may be appropriate in alternative environments.

To measure cost, we built a comprehensive testing suite for smart contract accounts for accurate, transaction-based, fee measurements, and fee calculations. You can find the repository, full methodology, and [full results here](https://github.com/alchemyplatform/aa-benchmarks). The results below were benchmarked on **Optimism on Feb 18, 2024**.

|                                 | Modular Account | Biconomy v2 | Kernel v2.1 | Safe        | Light Account |
| ------------------------------- | --------------- | ----------- | ----------- | ----------- | ------------- |
| UO: Account Creation            | $0.59           | $0.67       | $0.69       | $0.89       | $0.57         |
| UO: Native Transfer             | $0.53           | $0.57       | $0.54       | $0.54       | $0.53         |
| UO: ERC-20 Transfer             | $0.58           | $0.62       | $0.59       | $0.59       | $0.57         |
| UO: Session Key Creation        | $0.82           | $0.61       | $0.64       | Unsupported | Unsupported   |
| UO: Session Key Native Transfer | $0.59           | Unsupported | $0.71       | Unsupported | Unsupported   |
| UO: Session Key ERC-20 Transfer | $0.63           | $0.82       | $0.78       | Unsupported | Unsupported   |
| Runtime: Account Creation       | $0.20           | $0.23       | $0.28       | $0.43       | $0.17         |
| Runtime: Native Transfer        | $0.20           | Unsupported | $0.21       | $0.36       | $0.20         |
| Runtime: ERC-20 Transfer        | $0.25           | Unsupported | $0.26       | $0.41       | $0.25         |

Note that there is an inverse tradeoff in optimizing for rollups, versus optimizing for layer one Ethereum and side chains. These benchmarks capture performance for the rollup ecosystem.
