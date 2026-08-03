import Foundation
import CallKit

class CallDirectoryHandler: CXCallDirectoryProvider {
    
    // --- WORKSPACE WHITELIST CONFIGURATION ---
    // Add any important numbers starting with 3 here.
    // Format: [Phone_Number_With_Country_Code: "Display Label Name"]
    // Note: Numbers MUST be exactly 11 digits long (852 + 8-digit HK number).
    private let whitelist: [Int64: String] = [
        // Hospitals & Clinics
        85230012345: "Hospital Authority Office",
        85231234567: "Queen Elizabeth Hospital",
        85235055555: "Prince of Wales Hospital",
        
        // Banks & Anti-Fraud
        85231281234: "HSBC Fraud Verification",
        85236080000: "Bank of East Asia",
        85237187111: "Standard Chartered Bank",
        
        // Government Departments
        85231888888: "Inland Revenue Dept (Tax)",
        85238212000: "Immigration Department",
        
        // Universities & Schools
        85239171111: "HKU Administration",
        85239436000: "CUHK Campus Office",

        // Other
        85260832065: "Honey Shan"
    ]

    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self
        
        let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker")
        let isActive = sharedDefaults?.bool(forKey: "isBlockActive") ?? false
        
        if isActive {
            // 1. First, identify and display names for the whitelisted numbers
            addAllIdentificationPhoneNumbers(to: context)
            
            // 2. Next, block the massive 10M range, skipping the whitelisted items
            addAllBlockingPhoneNumbers(to: context)
        } else {
            print("Shield is OFF. All filters cleared.")
        }
        
        context.completeRequest()
    }

    private func addAllBlockingPhoneNumbers(to context: CXCallDirectoryExtensionContext) {
        let startNumber: Int64 = 85230000000
        let endNumber: Int64   = 85239999999
        let chunkSize: Int64   = 50000 // Small batches to protect the 15MB iOS memory limit
        
        var currentStart = startNumber
        
        // Convert whitelist keys into a fast hash set for O(1) loop lookups
        let whitelistSet = Set(whitelist.keys)
        
        while currentStart <= endNumber {
            autoreleasepool {
                let currentEnd = min(currentStart + chunkSize, endNumber)
                for number in currentStart...currentEnd {
                    
                    // CRITICAL WHITELIST CHECK: 
                    // If this number is in our whitelist, SKIP blocking it entirely.
                    if whitelistSet.contains(number) {
                        continue
                    }
                    
                    context.addBlockingEntry(withNextSequentialPhoneNumber: number)
                }
                currentStart = currentEnd + 1
            }
        }
    }

    private func addAllIdentificationPhoneNumbers(to context: CXCallDirectoryExtensionContext) {
        // iOS REQUIREMENT: Identification numbers MUST be fed into CallKit in strictly ascending order.
        let sortedWhitelistedNumbers = whitelist.keys.sorted()
        
        for number in sortedWhitelistedNumbers {
            if let label = whitelist[number] {
                context.addIdentificationEntry(withNextSequentialPhoneNumber: number, label: label)
            }
        }
    }
}

extension CallDirectoryHandler: CXCallDirectoryExtensionContextDelegate {
    func requestFailed(for extensionContext: CXCallDirectoryExtensionContext, withError error: Error) {}
}