import Foundation
import CallKit

class FirstCallDirectoryHandler: CXCallDirectoryProvider {
    
    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self
        
        context.removeAllBlockingEntries()
        
        let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker")
        let isActive = sharedDefaults?.bool(forKey: "isBlockActive") ?? false
        
        if isActive {
            blockNumbers(context: context, defaults: sharedDefaults)
        }
        
        context.completeRequest()
    }

    private func blockNumbers(context: CXCallDirectoryExtensionContext, defaults: UserDefaults?) {
    // 1. Safely retrieve Int64 values from UserDefaults
    let rawStart = (defaults?.object(forKey: "startNumber") as? Int64) ?? 0
    let rawEnd = (defaults?.object(forKey: "endNumber") as? Int64) ?? 0

    let startNumber: Int64 = rawStart == 0 ? 85230000000 : rawStart
    let endNumber: Int64 = rawEnd == 0 ? 85230000001 : rawEnd

    // 2. Prevent invalid range crashes
    guard startNumber <= endNumber else { return }

    let chunkSize: Int64 = 100_000
    var currentStart: Int64 = startNumber

    while currentStart <= endNumber {
        autoreleasepool {
            // 3. Corrected chunk end offset (-1)
            let currentEnd: Int64 = min(currentStart + chunkSize - 1, endNumber)
            
            for number in currentStart...currentEnd {
                context.addBlockingEntry(withNextSequentialPhoneNumber: number)
            }
            
            currentStart = currentEnd + 1
        }
    }
}

extension FirstCallDirectoryHandler: CXCallDirectoryExtensionContextDelegate {
    func requestFailed(for extensionContext: CXCallDirectoryExtensionContext, withError error: Error) {
        // Handle extension error
    }
}
