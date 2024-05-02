---
outline: deep
head:
  - - meta
    - property: og:title
      content: Multisig Plugin Smart Contract Technical Details
  - - meta
    - name: description
      content: What are the technical details for the Multisig Plugin?
  - - meta
    - property: og:description
      content: What are the technical details for the Multisig Plugin?
  - - meta
    - name: twitter:title
      content: Multisig Plugin Smart Contract Technical Details
  - - meta
    - name: twitter:description
      content: What are the technical details for the Multisig Plugin?
---

# Multisig Plugin Technical Details

## Storing Signatures

In the usage guide, for a threshold of `k` signatures, we obtain the first signature with `proposeUserOperation` and the next `k-2` signatures with `signMultisigUserOperation`. In practice, since signers would likely use different clients and sign at different times, the client or dapp will need to store the first `k-1` signatures. This would be loaded and combined with the final signature to be used with `sendUserOperation`.

## Gas Estimation

Gas estimations must be performed for user operations before the first signature is obtained. This is done in aa-sdk with built in gas and fee estimation middlewares.

We perform gas estimation assuming that the `k` signatures to be obtained are EOAs, and not other smart accounts. In the case that smart accounts own a modular account, the validation step could require more gas. If used with default gas estimation, it would cause the user operation to fail with an insufficient gas error.

In these cases, clients are expected to implement their own gas estimations for the signature validation step, and use gas overrides when first calling `proposeUserOperation`.

## Variable Gas Feature

For normal User Operations, gas prices and values have to be decided before the first signer's signature (and the paymaster's signature, if used). However, since it might take time to gather the `k` signatures, it is likely that when the `k`th signature is collected, the network gas values would have changed significantly. In this case, the account would be overpaying on gas, or the User Operation would be underpriced, and the `k` signatures have to be collected again on a new User Operation.

This multisig plugin includes a variable gas feature to address this problem. The fee values selected and signed over by the first `k-1` signers are treated as a "maximum fee" and the `k`th signer is able to choose final fee values to use based on the current network conditions. With this feature, there is no longer a risk of overpaying, or having to re-collect the `k` signatures.

However, note that the use of this feature would likely not work with regular paymaster services, including Alchemy's Gas Manager product.
