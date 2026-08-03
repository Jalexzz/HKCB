import Foundation
import CallKit

class CallDirectoryHandler: CXCallDirectoryProvider {
    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self
        
        let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker")
        
        // Check if the user turned the shield ON or OFF
        let isActive = sharedDefaults?.bool(forKey: "isBlockActive") ?? false
        
        if isActive {
            addAllBlockingPhoneNumbers(to: context)
            print("Shield is ON. Numbers loaded.")
        } else {
            print("Shield is OFF. Block list cleared.")
        }
        
        context.completeRequest()
    }

    private func addAllBlockingPhoneNumbers(to context: CXCallDirectoryExtensionContext) {
        // Hong Kong numbers: 852 3000 0000 to 852 3999 9999
        let startNumber: Int64 = 85230000000
        let endNumber: Int64   = 85239999999
        
        for number in startNumber...endNumber {
            context.addBlockingEntry(withNextSequentialPhoneNumber: number)
        }
    }
}

extension CallDirectoryHandler: CXCallDirectoryExtensionContextDelegate {
    func requestFailed(for extensionContext: CXCallDirectoryExtensionContext, withError error: Error) {}
}