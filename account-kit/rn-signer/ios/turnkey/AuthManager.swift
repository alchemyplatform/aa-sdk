//
//  AuthManager.swift
//
//  This file contains the implementation of the AuthManager, which provides functionalities
//  for decrypting encrypted bundles using elliptic curve cryptography.
//
//

import Base58Swift
import CryptoKit
import Foundation

public enum AuthError: Error {
  case invalidCompressedKeyLength
  case keyDecryptionFailed(Error)
}

/// A manager responsible for handling authentication processes, specifically
/// dealing with cryptographic operations related to key decryption.
public struct AuthManager {

  /// Decrypts an encrypted bundle using a given ephemeral private key.
  ///
  /// This method decodes the encrypted bundle, extracts and processes the encapsulated key,
  /// and then decrypts the private key using HPKE (Hybrid Public Key Encryption).
  ///
  /// - Parameters:
  ///   - encryptedBundle: The encrypted data as a Base58Check encoded string received by the user via their provided email address during the email authentication process.
  ///   - ephemeralPrivateKey: The ephemeral private key used for decryption, conforming to `P256.KeyAgreement.PrivateKey`.
  /// - Returns: A tuple containing the decrypted `P256.Signing.PrivateKey` and its corresponding `P256.Signing.PublicKey`.
  /// - Throws: `AuthError.invalidCompressedKeyLength` if the encapsulated key length is incorrect,
  ///           `AuthError.keyDecryptionFailed` if any step in the decryption process fails.
  public static func decryptBundle(
    encryptedBundle: String, ephemeralPrivateKey: P256.KeyAgreement.PrivateKey
  ) throws
    -> (P256.Signing.PrivateKey, P256.Signing.PublicKey)
  {
//    let base58Check = Base58Check()
    do {
      // Decode the encrypted bundle from Base58Check format.
        // TODO: need to throw here in case this returns null
        let decodedEncryptedBundle = Base58.base58CheckDecode(encryptedBundle)!

      // Extract the first 33 bytes as the compressed encapsulated key.
      let compressedEncapsulatedKey = decodedEncryptedBundle.prefix(33)
      // The remainder is the encrypted private key.
      let encryptedPrivateKey = decodedEncryptedBundle.dropFirst(33)

      guard compressedEncapsulatedKey.count == 33 else {
        throw AuthError.invalidCompressedKeyLength
      }

      let uncompressedEncapsulatedKey = try P256.KeyAgreement.PublicKey(
        compressedRepresentation: compressedEncapsulatedKey
      ).x963Representation

      let receiverPublicKey = ephemeralPrivateKey.publicKey.x963Representation

      let ciphersuite = HPKE.Ciphersuite(
        kem: HPKE.KEM.P256_HKDF_SHA256, kdf: HPKE.KDF.HKDF_SHA256, aead: HPKE.AEAD.AES_GCM_256)

      var recipient = try HPKE.Recipient(
        privateKey: ephemeralPrivateKey,
        ciphersuite: ciphersuite,
        info: "turnkey_hpke".data(using: .utf8)!,
        encapsulatedKey: uncompressedEncapsulatedKey
      )

      // Add the additional authenticated data for the decryption process.
      let aad = uncompressedEncapsulatedKey + receiverPublicKey

      // Decrypt the private key using the recipient object.
      let compressedPrivateKey = try recipient.open(encryptedPrivateKey, authenticating: aad)

      // Create the signing private key from its raw representation.
      let privateKey = try P256.Signing.PrivateKey(rawRepresentation: compressedPrivateKey)

      let publicKey = privateKey.publicKey

      return (privateKey: privateKey, publicKey: publicKey)
    } catch {
      throw AuthError.keyDecryptionFailed(error)
    }
  }
}
