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
      
      // Open the shared App Group database
      if let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker") {
        sharedDefaults.set(isActive, forKey: "isBlockActive")
        sharedDefaults.set(prefixes, forKey: "whitelistedPrefixes")
        sharedDefaults.set(specifics, forKey: "specificWhitelist")
        sharedDefaults.synchronize()
      }
      
      // Wake up the CallKit background extension process to pull fresh data
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