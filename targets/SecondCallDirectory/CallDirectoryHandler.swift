import Foundation
import CallKit

class CallDirectoryHandler: CXCallDirectoryProvider {
    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self
        
        let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker.coaddata")
        let isActive = sharedDefaults?.bool(forKey: "isBlockActive") ?? false
        
        if isActive {
            addBatchNumbers(to: context, defaults: sharedDefaults)
        }
        
        context.completeRequest()
    }

    private func addBatchNumbers(to context: CXCallDirectoryExtensionContext, defaults: UserDefaults?) {
        // Read via integer(forKey:) to ensure valid conversion
        let startRaw = defaults?.integer(forKey: "startNumber") ?? 0
        let endRaw = defaults?.integer(forKey: "endNumber") ?? 0
        
        let startNumber: Int64 = startRaw != 0 ? Int64(startRaw) : 85230000051
        let endNumber: Int64 = endRaw != 0 ? Int64(endRaw) : 85230000100
        
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