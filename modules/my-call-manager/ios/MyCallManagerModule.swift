import ExpoModulesCore
import CallKit

public class MyCallManagerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyCallManager")
    
    // 1. Dedicated function to save Whitelist data to App Group
    AsyncFunction("saveWhitelist") { (
      prefixes: [Int64], 
      specifics: [String: String], 
      promise: Promise
    ) in
      if let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker") {
        sharedDefaults.set(prefixes, forKey: "whitelistedPrefixes")
        sharedDefaults.set(specifics, forKey: "specificWhitelist")
        sharedDefaults.synchronize()
        promise.resolve(true)
      } else {
        promise.reject("ERR_DEFAULTS", "Could not access App Group UserDefaults", nil)
      }
    }

    // Update the arguments to include startNumber and endNumber
    AsyncFunction("setBlockStateAndReload") { (isActive: Bool, startNumber: Int, endNumber: Int, identifier: String, promise: Promise) in
      
      // Save state to App Group
      if let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker") {
        sharedDefaults.set(isActive, forKey: "isBlockActive_\(identifier)")
        // Save the dynamic numbers
        sharedDefaults.set(startNumber, forKey: "startNumber")
        sharedDefaults.set(endNumber, forKey: "endNumber")
        sharedDefaults.synchronize()
      }
      
      CXCallDirectoryManager.sharedInstance.reloadExtension(withIdentifier: identifier) { error in
        if let error = error {
          promise.reject("ERR_RELOAD", error.localizedDescription, error)
        } else {
          promise.resolve(true)
        }
      }
    }
  }
}
