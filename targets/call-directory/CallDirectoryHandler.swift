import Foundation
import CallKit

class CallDirectoryHandler: CXCallDirectoryProvider {
    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self
        
        let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker")
        let isActive = sharedDefaults?.bool(forKey: "isBlockActive") ?? false
        
        if isActive {
            addAllBlockingPhoneNumbers(to: context)
        } else {
            print("Shield is OFF. Block list cleared.")
        }
        
        context.completeRequest()
    }

    private func addAllBlockingPhoneNumbers(to context: CXCallDirectoryExtensionContext) {
        let startNumber: Int64 = 85230000000
        let endNumber: Int64   = 85239999999
        let chunkSize: Int64   = 50000  // Process numbers in small, safe memory batches
        
        var currentStart = startNumber
        
        while currentStart <= endNumber {
            // CRITICAL: This pool clears memory instantly before hitting the iOS 15MB wall
            autoreleasepool {
                let currentEnd = min(currentStart + chunkSize, endNumber)
                for number in currentStart...currentEnd {
                    context.addBlockingEntry(withNextSequentialPhoneNumber: number)
                }
                currentStart = currentEnd + 1
            }
        }
    }
}

extension CallDirectoryHandler: CXCallDirectoryExtensionContextDelegate {
    func requestFailed(for extensionContext: CXCallDirectoryExtensionContext, withError error: Error) {}
}