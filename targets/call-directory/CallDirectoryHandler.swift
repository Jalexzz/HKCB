import Foundation
import CallKit

class CallDirectoryHandler: CXCallDirectoryProvider {
    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self
        
        let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker")
        let isActive = sharedDefaults?.bool(forKey: "isBlockActive") ?? false
        
        if isActive {
            addBatch1Numbers(to: context, defaults: sharedDefaults)
        }
        
        context.completeRequest()
    }

    private func addBatch1Numbers(to context: CXCallDirectoryExtensionContext, defaults: UserDefaults?) {
        // Read via integer(forKey:) to ensure valid conversion
        let startRaw = defaults?.integer(forKey: "batch1StartNumber") ?? 0
        let endRaw = defaults?.integer(forKey: "batch1EndNumber") ?? 0
        
        let startNumber: Int64 = startRaw != 0 ? Int64(startRaw) : 85230000000
        let endNumber: Int64 = endRaw != 0 ? Int64(endRaw) : 85230000050
        
        // CallKit requires numbers to be added in strictly ascending order
        guard startNumber <= endNumber else { return }
        
        for number in startNumber...endNumber {
            context.addBlockingEntry(withNextSequentialPhoneNumber: number)
        }
    }
}

extension CallDirectoryHandler: CXCallDirectoryExtensionContextDelegate {
    func requestFailed(for extensionContext: CXCallDirectoryExtensionContext, withError error: Error) {}
}