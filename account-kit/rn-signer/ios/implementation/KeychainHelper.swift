import Foundation
import Security
import CryptoKit


class KeychainHelper {
    static let shared = KeychainHelper() // Singleton instance

    private init() {} // Prevent external instantiation
    
    private let keyIdentifier = "ephemeralPrivateKey"

    func savePrivateKeyToKeychain(_ privateKey: P256.KeyAgreement.PrivateKey) {
        let keyData = privateKey.rawRepresentation

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: keyIdentifier,
            kSecValueData as String: keyData,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]

        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }

    func getPrivateKeyFromKeychain() -> P256.KeyAgreement.PrivateKey? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: keyIdentifier,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

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
         let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: keyIdentifier
        ]
        SecItemDelete(query as CFDictionary)
    }
}
