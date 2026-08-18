import Foundation
import CallKit

class FirstCallDirectoryHandler: CXCallDirectoryProvider {
    
    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self
        
        let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker")
        let isActive = sharedDefaults?.bool(forKey: "isBlockActive") ?? false
        
        if isActive {
            // Process 10 million numbers in batch ranges
            blockTenMillionNumbers(context: context, defaults: sharedDefaults)
        }
        
        context.completeRequest()
    }

    private func blockTenMillionNumbers(context: CXCallDirectoryExtensionContext, defaults: UserDefaults?) {
       
       /*
        // Read start prefix or range parameters from shared app group
        let startRaw = defaults?.integer(forKey: "startNumber") ?? 9999999
        let baseNumber: Int64 = startRaw != 0 ? Int64(startRaw) : 85230000000
        
        // Block 10,000,000 sequential phone numbers (e.g. 85230000000 to 85239999999)
        let totalCount: Int64 = 10_000_000
        let batchSize: Int64 = 100_000
        
        var currentOffset: Int64 = 0
        
        while currentOffset < totalCount {
            // Autoreleasepool flushes memory after each 100k batch
            autoreleasepool {
                let batchStart = baseNumber + currentOffset
                let batchEnd = min(batchStart + batchSize - 1, baseNumber + totalCount - 1)
                
                for number in batchStart...batchEnd {
                    context.addBlockingEntry(withNextSequentialPhoneNumber: number)
                }
            }
            currentOffset += batchSize
        }
*/
        
        // ⚠️ CHANGE THESE TWO VARIABLES IN EACH OF THE 3 FOLDERS ⚠️
        let startNumber = defaults?.integer(forKey: "startNumber") ?? 85230000000
        let endNumber = defaults?.integer(forKey: "endNumber") ?? 85230000001
        
        let chunkSize = 100000
        var currentStart = startNumber
        
        while currentStart <= endNumber {
            autoreleasepool {
                let currentEnd = min(currentStart + chunkSize, endNumber)
                for number in currentStart...currentEnd {
                    
                    //if whitelistKeys.contains(number) { continue }
                    //let prefixBlock = number / 10000
                    //if prefixes.contains(prefixBlock) { continue }
                    
                    context.addBlockingEntry(withNextSequentialPhoneNumber: number)
                }
                currentStart = currentEnd + 1
            }
        }
    }
}

extension FirstCallDirectoryHandler: CXCallDirectoryExtensionContextDelegate {
    func requestFailed(for extensionContext: CXCallDirectoryExtensionContext, withError error: Error) {
        // Handle extension error
    }
}
