import CryptoKit
import Foundation

enum StamperError: Error {
    case notInitialized
    case invalidPayload
    case signatureFailed
    case failedToSerializePayloadToJSON(Error)
}

@objc public class NativeTEKStamperImpl: NSObject {
    // TODO: we probably want to keep this longer term somewhere, because the RN session manager will
    // hold on to the bundle and try to recreate a session if a user is still logged in
    var ephemeralPrivateKey: P256.KeyAgreement.PrivateKey? = nil;
    
    // These can be ephemeral and held in memory because the session manager will handle re-authenticating
    var apiPublicKey: P256.Signing.PublicKey? = nil;
    var apiPrivateKey: P256.Signing.PrivateKey? = nil;
    
    @objc public func create() async throws -> NSString {
        if (ephemeralPrivateKey == nil) {
            ephemeralPrivateKey = P256.KeyAgreement.PrivateKey()
        }
        let targetPublicKey = try ephemeralPrivateKey!.publicKey.toString(representation: .x963)
        
        return NSString(string: targetPublicKey)
    }
    
    @objc public func clear() {
        ephemeralPrivateKey = nil
        apiPublicKey = nil
        apiPrivateKey = nil
    }
    
    @objc public func publicKey() -> NSString? {
        if let ephemeralPrivateKey = ephemeralPrivateKey {
            let publicKey = try? ephemeralPrivateKey.publicKey.toString(representation: .x963)
            return publicKey != nil ? NSString(string: publicKey!) : nil
        } else {
            return nil;
        }
    }
    
    @objc public func injectCredentialBundle(bundle: NSString) async throws -> ObjCBool {
        if let ephemeralPrivateKey = ephemeralPrivateKey {
            let (bundlePrivateKey, bundlePublicKey) = try AuthManager.decryptBundle(encryptedBundle: bundle as String, ephemeralPrivateKey: ephemeralPrivateKey)
            
            apiPublicKey = bundlePublicKey
            apiPrivateKey = bundlePrivateKey
            
            return true;
        } else {
            throw StamperError.notInitialized
        }
    }
    
    // TODO: we should use the turnkey stamper for all of this, but we need it published as a pod
    // and it shouldn't require use_frameworks!
    @objc public func stamp(payload: NSString) async throws -> [String: NSString] {
        if let apiPublicKey = apiPublicKey, let apiPrivateKey = apiPrivateKey {
            guard let payloadData = String(payload).data(using: .utf8) else {
                throw StamperError.invalidPayload
            }

            let payloadHash = SHA256.hash(data: payloadData)
            
            guard let signature = try? apiPrivateKey.signature(for: payloadHash) else {
                throw StamperError.signatureFailed
            }
            
            let signatureHex = signature.derRepresentation.toHexString()

            print(apiPublicKey.compressedRepresentation.toHexString())
            let stamp: [String: Any] = [
              "publicKey": apiPublicKey.compressedRepresentation.toHexString(),
              "scheme": "SIGNATURE_SCHEME_TK_API_P256",
              "signature": signatureHex,
            ]
            
            do {
              let jsonData = try JSONSerialization.data(withJSONObject: stamp, options: [])
              let base64Stamp = jsonData.base64URLEncodedString()
                
              return [
                "stampHeaderName": NSString(string: "X-Stamp"),
                "stampHeaderValue": NSString(string: base64Stamp),
              ]
            } catch {
                throw StamperError.failedToSerializePayloadToJSON(error)
            }
        } else {
            throw StamperError.notInitialized
        }
    }
}
