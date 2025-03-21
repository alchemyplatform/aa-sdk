import Foundation
import Security
import CryptoKit

let ACCOUNT_KIT_EPHEMERAL_PRIVATE_KEY = "accountKitEphemeralPrivateKey"

let save_ephemeral_private_key_query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccount as String: ACCOUNT_KIT_EPHEMERAL_PRIVATE_KEY,
    kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
]
 
let get_ephemeral_private_key_query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccount as String: ACCOUNT_KIT_EPHEMERAL_PRIVATE_KEY,
    kSecReturnData as String: true,
    kSecMatchLimit as String: kSecMatchLimitOne
]

let delete_ephemeral_private_key_query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccount as String: ACCOUNT_KIT_EPHEMERAL_PRIVATE_KEY
]


struct PrivateKeyChainUtilities {
    @available(*, unavailable) private init() {}

    static func savePrivateKeyToKeychain(_ privateKey: P256.KeyAgreement.PrivateKey) {
        let keyData = privateKey.rawRepresentation
        
        var _saveEphemeralPrivateKeyQuery = save_ephemeral_private_key_query
        _saveEphemeralPrivateKeyQuery.updateValue(keyData, forKey: kSecValueData as String)
        
        SecItemDelete(_saveEphemeralPrivateKeyQuery as CFDictionary)
        SecItemAdd(_saveEphemeralPrivateKeyQuery as CFDictionary, nil)
    }

    static func getPrivateKeyFromKeychain() -> P256.KeyAgreement.PrivateKey? {
        var result: AnyObject?
        let status = SecItemCopyMatching(get_ephemeral_private_key_query as CFDictionary, &result)

        if status == errSecSuccess, let keyData = result as? Data {
            do {
                return try P256.KeyAgreement.PrivateKey(rawRepresentation: keyData)
            } catch {
                print("❌ Failed to decode private key: \(error)")
                return nil
            }
        }

        return nil
    }

    static func deletePrivateKeyFromKeychain() {
        SecItemDelete(delete_ephemeral_private_key_query as CFDictionary)
    }
}
