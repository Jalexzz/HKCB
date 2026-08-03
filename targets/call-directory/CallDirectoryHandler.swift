import Foundation
import CallKit

class CallDirectoryHandler: CXCallDirectoryProvider {

    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self
        
        let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker")
        let isActive = sharedDefaults?.bool(forKey: "isBlockActive") ?? false
        
        if isActive {
            // 1. Fetch data arrays dynamically saved by the Frontend
            let savedPrefixes = sharedDefaults?.array(forKey: "whitelistedPrefixes") as? [Int64] ?? []
            let whitelistedPrefixes = Set(savedPrefixes)
            
            let savedSpecifics = sharedDefaults?.dictionary(forKey: "specificWhitelist") as? [String: String] ?? [:]
            var specificWhitelist: [Int64: String] = [:]
            for (key, value) in savedSpecifics {
                if let intKey = Int64(key) {
                    specificWhitelist[intKey] = value
                }
            }
            
            // 2. Process Identification (Caller ID displays)
            addAllIdentificationPhoneNumbers(to: context, whitelist: specificWhitelist)
            
            // 3. Process Block List stream
            addAllBlockingPhoneNumbers(to: context, prefixes: whitelistedPrefixes, whitelistKeys: Set(specificWhitelist.keys))
        } else {
            print("Shield is OFF. All logs purged.")
        }
        
        context.completeRequest()
    }

    private func addAllBlockingPhoneNumbers(to context: CXCallDirectoryExtensionContext, prefixes: Set<Int64>, whitelistKeys: Set<Int64>) {
        let startNumber: Int64 = 85230000000
        let endNumber: Int64   = 85239999999
        let chunkSize: Int64   = 50000
        
        var currentStart = startNumber
        
        while currentStart <= endNumber {
            autoreleasepool {
                let currentEnd = min(currentStart + chunkSize, endNumber)
                for number in currentStart...currentEnd {
                    
                    if whitelistKeys.contains(number) {
                        continue
                    }
                    
                    let prefixBlock = number / 10000
                    if prefixes.contains(prefixBlock) {
                        continue
                    }
                    
                    context.addBlockingEntry(withNextSequentialPhoneNumber: number)
                }
                currentStart = currentEnd + 1
            }
        }
    }

    private func addAllIdentificationPhoneNumbers(to context: CXCallDirectoryExtensionContext, whitelist: [Int64: String]) {
        let sortedKeys = whitelist.keys.sorted()
        for number in sortedKeys {
            if let label = whitelist[number] {
                context.addIdentificationEntry(withNextSequentialPhoneNumber: number, label: label)
            }
        }
    }
}

extension CallDirectoryHandler: CXCallDirectoryExtensionContextDelegate {
    func requestFailed(for extensionContext: CXCallDirectoryExtensionContext, withError error: Error) {}
}