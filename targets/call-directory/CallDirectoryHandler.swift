import Foundation
import CallKit

class CallDirectoryHandler: CXCallDirectoryProvider {
    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self
        
        let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker")
        
        // Check if the user turned the shield ON or OFF
        let isActive = sharedDefaults?.bool(forKey: "isBlockActive") ?? false
        
        if isActive {
            // Pass the sharedDefaults so we can read the numbers
            addAllBlockingPhoneNumbers(to: context, defaults: sharedDefaults)
            print("Shield is ON. Numbers loaded.")
        } else {
            print("Shield is OFF. Block list cleared.")
        }
        
        context.completeRequest()
    }

    private func addAllBlockingPhoneNumbers(to context: CXCallDirectoryExtensionContext, defaults: UserDefaults?) {
        // Retrieve the numbers from defaults, falling back to your original values if they don't exist
        let startNumber = defaults?.object(forKey: "startNumber") as? Int64 ?? 85230000000
        let endNumber = defaults?.object(forKey: "endNumber") as? Int64 ?? 85230000001
        
        for number in startNumber...endNumber {
            context.addBlockingEntry(withNextSequentialPhoneNumber: number)
        }
    }
}

extension CallDirectoryHandler: CXCallDirectoryExtensionContextDelegate {
    func requestFailed(for extensionContext: CXCallDirectoryExtensionContext, withError error: Error) {}
}