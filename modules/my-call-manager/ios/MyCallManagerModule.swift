import ExpoModulesCore
import CallKit

public class MyCallManagerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyCallManager")

    AsyncFunction("setBlockStateAndReload") { (
      isActive: Bool, 
      identifier: String, 
      prefixes: [Int64], 
      specifics: [String: String], 
      promise: Promise
    ) in
      
      if let sharedDefaults = UserDefaults(suiteName: "group.com.yourname.hkcallblocker") {
        // NEW: Save the active state uniquely for this specific extension identifier
        sharedDefaults.set(isActive, forKey: "isBlockActive_\(identifier)")
        sharedDefaults.set(prefixes, forKey: "whitelistedPrefixes")
        sharedDefaults.set(specifics, forKey: "specificWhitelist")
        sharedDefaults.synchronize()
      }
      
      CXCallDirectoryManager.sharedInstance.reloadExtension(withIdentifier: identifier) { error in
        if let error = error {
          promise.reject(error)
        } else {
          promise.resolve(true)
        }
      }
    }
  }
}
