//
//  P256+String.swift
//
//
//

import CryptoKit
import Foundation

enum KeyError: Error {
  case representationUnavailable(String)
}

public protocol P256KeyProtocol {
  var rawRepresentation: Data { get }
  var x963Representation: Data { get }
}

public protocol P256PublicKeyProtocol: P256KeyProtocol {
  @available(iOS 16.0, macOS 13.0, watchOS 9.0, tvOS 16.0, *)
  var compressedRepresentation: Data { get }
  var compactRepresentation: Data? { get }
}

extension P256KeyProtocol {
  /// Converts the key into the specified string representation.
  ///
  /// - Parameter representation: The desired representation of the key.
  /// - Returns: A string representation of the key in the specified format.
  /// - Throws: `KeyError.representationUnavailable` if the desired representation is not available.
  public func toString(representation: PrivateKeyRepresentation) throws -> String {
    switch representation {
    case .raw:
      return rawRepresentation.toHexString()
    case .x963:
      return x963Representation.toHexString()
    }
  }
}

extension P256.Signing.PublicKey: P256PublicKeyProtocol {}
extension P256.KeyAgreement.PublicKey: P256PublicKeyProtocol {}

public enum PublicKeyRepresentation {
  case raw
  case x963
  case compressed
  case compact
}

extension P256PublicKeyProtocol {
  /// Converts the public key into the specified string representation.
  ///
  /// - Parameter representation: The desired representation of the key.
  /// - Returns: A string representation of the public key in the specified format.
  /// - Throws: `KeyError.representationUnavailable` if the desired representation is not available.
  public func toString(representation: PublicKeyRepresentation) throws -> String {
    switch representation {
    case .raw:
      return rawRepresentation.toHexString()
    case .x963:
      return x963Representation.toHexString()
    case .compressed:
      if #available(iOS 16.0, macOS 13.0, watchOS 9.0, tvOS 16.0, *) {
        return compressedRepresentation.toHexString()
      } else {
        throw KeyError.representationUnavailable("Compressed representation is unavailable.")
      }
    case .compact:
      return compactRepresentation?.toHexString() ?? ""
    }
  }
}

public enum PrivateKeyRepresentation {
  case raw
  case x963
}

extension P256.Signing.PrivateKey: P256KeyProtocol {}
extension P256.KeyAgreement.PrivateKey: P256KeyProtocol {}

extension P256.Signing.PrivateKey {
  /// Converts the private key into the specified string representation.
  ///
  /// - Parameter representation: The desired representation of the key.
  /// - Returns: A string representation of the private key in the specified format.
  /// - Throws: `KeyError.representationUnavailable` if the desired representation is not available.
  public func toString(representation: PrivateKeyRepresentation) throws -> String {
    switch representation {
    case .raw:
      return rawRepresentation.toHexString()
    case .x963:
      return x963Representation.toHexString()
    }
  }
}
