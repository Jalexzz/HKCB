import ExpoModulesCore
import CallKit

public class MyCallManagerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyCallManager")

    AsyncFunction("setBlockStateAndReload") { (isActive: Bool, identifier: String, promise: Promise) in
      
      // Save state to App Group
      if let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker") {
        sharedDefaults.set(isActive, forKey: "isBlockActive")
        sharedDefaults.synchronize()
      }
      
      // Tell iOS CallKit to apply changes
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