import Foundation
import Security
import CryptoKit

let account_kit_ephemeral_private_key = "ephemeralPrivateKey"

// Keep save_ephemeral_private_key_query mutable
var save_ephemeral_private_key_query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccount as String: account_kit_ephemeral_private_key,
    kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
]

let get_ephemeral_private_key_query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccount as String: account_kit_ephemeral_private_key,
    kSecReturnData as String: true,
    kSecMatchLimit as String: kSecMatchLimitOne
]

let delete_ephemeral_private_key_query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccount as String: account_kit_ephemeral_private_key
]


class KeychainHelper {
    static let shared = KeychainHelper() // Singleton instance

    private init() {} // Prevent external instantiation

    func savePrivateKeyToKeychain(_ privateKey: P256.KeyAgreement.PrivateKey) {
        let keyData = privateKey.rawRepresentation
        save_ephemeral_private_key_query.updateValue(keyData, forKey: kSecValueData as String)
        SecItemDelete(save_ephemeral_private_key_query as CFDictionary)
        SecItemAdd(save_ephemeral_private_key_query as CFDictionary, nil)
    }

    func getPrivateKeyFromKeychain() -> P256.KeyAgreement.PrivateKey? {
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

    func deletePrivateKeyFromKeychain() {
        SecItemDelete(delete_ephemeral_private_key_query as CFDictionary)
    }
}
