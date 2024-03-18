---
outline: deep
head:
  - - meta
    - property: og:title
      content: Integrate a Signer
  - - meta
    - name: description
      content: How to integrate a 3rd party signer.
  - - meta
    - property: og:description
      content: How to integrate a 3rd party signer.
  - - meta
    - name: twitter:title
      content: Integrate a Signer
  - - meta
    - name: twitter:description
      content: How to integrate a 3rd party signer.
---

# Integrate a signer

Now that you've selected a Signer to use, you can integrate it to use with your custom account. The `aa-sdk` currently exports a number of adapters for popular signers. Refer to the section in the sidebar titled, "Third-party signers" for more information on how to integrate a signer with your custom account or take a look at [`aa-signers`](/packages/aa-signers/index).

## Custom Signers

<!--@include: @/signers/guides/custom-signer.md{23,31}-->

### 1. Implementing `SmartAccountAuthenticator` or `SmartAccountSigner`

<!--@include: @/signers/guides/custom-signer.md{33,37}-->

### 2. Using `WalletClientSigner`

<!--@include: @/signers/guides/custom-signer.md{40,}-->
