import Foundation
import CallKit

class CallDirectoryHandler: CXCallDirectoryProvider {

    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self
        
        let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker")
        
        // NEW: Extension dynamically checks its own state based on its Bundle Identifier
        let myBundleId = Bundle.main.bundleIdentifier ?? ""
        let isActive = sharedDefaults?.bool(forKey: "isBlockActive_\(myBundleId)") ?? false
        
        if isActive {
            let savedPrefixes = sharedDefaults?.array(forKey: "whitelistedPrefixes") as? [NSNumber] ?? []
            let whitelistedPrefixes = Set(savedPrefixes.map { $0.int64Value })
            
            let savedSpecifics = sharedDefaults?.dictionary(forKey: "specificWhitelist") as? [String: String] ?? [:]
            var specificWhitelist: [Int64: String] = [:]
            for (key, value) in savedSpecifics {
                if let intKey = Int64(key) {
                    specificWhitelist[intKey] = value
                }
            }
            
            addAllIdentificationPhoneNumbers(to: context, whitelist: specificWhitelist)
            addAllBlockingPhoneNumbers(to: context, prefixes: whitelistedPrefixes, whitelistKeys: Set(specificWhitelist.keys))
        }
        
        context.completeRequest()
    }

    private func addAllBlockingPhoneNumbers(to context: CXCallDirectoryExtensionContext, prefixes: Set<Int64>, whitelistKeys: Set<Int64>) {
        
        // ⚠️ CHANGE THESE TWO VARIABLES IN EACH OF THE 3 FOLDERS ⚠️
        let startNumber: Int64 = 85233333334
        let endNumber: Int64   = 85236666666
        
        let chunkSize: Int64   = 50000
        var currentStart = startNumber
        
        while currentStart <= endNumber {
            autoreleasepool {
                let currentEnd = min(currentStart + chunkSize, endNumber)
                for number in currentStart...currentEnd {
                    
                    if whitelistKeys.contains(number) { continue }
                    let prefixBlock = number / 10000
                    if prefixes.contains(prefixBlock) { continue }
                    
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
