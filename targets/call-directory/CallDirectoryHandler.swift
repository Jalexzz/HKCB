import Foundation
import CallKit

class CallDirectoryHandler: CXCallDirectoryProvider {
    
    // --- 1. ENTIRE INSTITUTIONAL PREFIX BLOCKS (Whitelists 10,000 numbers per entry) ---
    // If a number matches this prefix, it will bypass the blocker and ring through normally.
    // Example: 8523943 whitelists everything from 85239430000 to 85239439999.
    private let whitelistedPrefixes: Set<Int64> = [
        // --- PUBLIC HOSPITALS (Hospital Authority Blocks) ---
        8523505, // Prince of Wales Hospital (Sha Tin)
        8523506, // Queen Elizabeth Hospital / Kowloon Central Cluster
        8523949, // United Christian Hospital (Kwun Tong)
        8523408, // Caritas Medical Centre (Sham Shui Po)
        8523513, // Hong Kong Children's Hospital (Kowloon Bay)
        8523129, // North District Hospital / Alice Ho Miu Ling Nethersole Hospital
        
        // --- UNIVERSITIES ---
        8523943, // CUHK (The Chinese University of Hong Kong) - All departments
        8523917, // HKU (The University of Hong Kong) - Main administrative & faculties
        8523442, // CityU (City University of Hong Kong)
        8523400, // PolyU (The Hong Kong Polytechnic University)
        8523411, // HKBU (Hong Kong Baptist University)
        8523963, // HSUHK (The Hang Seng University of Hong Kong)
        
        // --- MAJOR GOVERNMENT BLOCKS ---
        8523142, // Integrated Call Centre / Efficiency Office (1823 Hotline Support)
        8523919, // Legislative Council Secretariat
        8523821  // Immigration Department (Specific Administrative Blocks)
    ]
    
    // --- 2. SPECIFIC HIGH-PROFILE CENTRAL LINES (With Custom Caller ID Names) ---
    // Format: [Phone_Number: "Display Name"]
    // Must be exactly 11 digits (852 + 8 digits). Sorted ascending for iOS.
    private let specificWhitelist: [Int64: String] = [
        // Government & Utilities
        85231015555: "Companies Registry Hotline",
        85237596888: "Customs & Excise Department",
        85239001111: "Hong Kong Police Force HQ",
        
        // Major Banking Support / Outbound Fraud Detection Lines
        85236670800: "HSBC Customer Services",
        85237141388: "Hang Seng Bank Helpline",
        85237181818: "Standard Chartered Bank",
        85239882388: "Bank of China (HK) Hotline"

        // Other
        85260832065: "Honey Shan"
    ]

    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self
        
        let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker")
        let isActive = sharedDefaults?.bool(forKey: "isBlockActive") ?? false
        
        if isActive {
            // 1. Label the explicit individual numbers
            addAllIdentificationPhoneNumbers(to: context)
            
            // 2. Block the 10M stream, skipping all matched blocks and individual numbers
            addAllBlockingPhoneNumbers(to: context)
        } else {
            print("Shield is OFF. Call filters purged.")
        }
        
        context.completeRequest()
    }

    private func addAllBlockingPhoneNumbers(to context: CXCallDirectoryExtensionContext) {
        let startNumber: Int64 = 85230000000
        let endNumber: Int64   = 85239999999
        let chunkSize: Int64   = 50000
        
        var currentStart = startNumber
        let specificWhitelistKeys = Set(specificWhitelist.keys)
        
        while currentStart <= endNumber {
            autoreleasepool {
                let currentEnd = min(currentStart + chunkSize, endNumber)
                for number in currentStart...currentEnd {
                    
                    // Rule A: Skip if explicitly listed in individual whitelists
                    if specificWhitelistKeys.contains(number) {
                        continue
                    }
                    
                    // Rule B: Extract the first 7 digits (Country Code + 4 digits) to check the institutional block
                    let prefixBlock = number / 10000
                    if whitelistedPrefixes.contains(prefixBlock) {
                        continue
                    }
                    
                    context.addBlockingEntry(withNextSequentialPhoneNumber: number)
                }
                currentStart = currentEnd + 1
            }
        }
    }

    private func addAllIdentificationPhoneNumbers(to context: CXCallDirectoryExtensionContext) {
        let sortedKeys = specificWhitelist.keys.sorted()
        for number in sortedKeys {
            if let label = specificWhitelist[number] {
                context.addIdentificationEntry(withNextSequentialPhoneNumber: number, label: label)
            }
        }
    }
}

extension CallDirectoryHandler: CXCallDirectoryExtensionContextDelegate {
    func requestFailed(for extensionContext: CXCallDirectoryExtensionContext, withError error: Error) {}
}