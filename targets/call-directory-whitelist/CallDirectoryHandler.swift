import Foundation
import CallKit

class CallDirectoryHandler: CXCallDirectoryProvider {

    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self
        
        let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker")
        let myBundleId = Bundle.main.bundleIdentifier ?? ""
        let isActive = sharedDefaults?.bool(forKey: "isBlockActive_\(myBundleId)") ?? false
        
        if isActive {
            let savedSpecifics = sharedDefaults?.dictionary(forKey: "specificWhitelist") as? [String: String] ?? [:]
            var specificWhitelist: [Int64: String] = [:]
            for (key, value) in savedSpecifics {
                if let intKey = Int64(key) {
                    specificWhitelist[intKey] = value
                }
            }
            
            // Only registers identification labels (Hospital names, Banks, Gov)
            let sortedKeys = specificWhitelist.keys.sorted()
            for number in sortedKeys {
                if let label = specificWhitelist[number] {
                    context.addIdentificationEntry(withNextSequentialPhoneNumber: number, label: label)
                }
            }
        }
        
        context.completeRequest()
    }
}

extension CallDirectoryHandler: CXCallDirectoryExtensionContextDelegate {
    func requestFailed(for extensionContext: CXCallDirectoryExtensionContext, withError error: Error) {}
}
