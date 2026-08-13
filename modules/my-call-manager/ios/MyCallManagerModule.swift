import ExpoModulesCore
import CallKit

public class MyCallManagerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyCallManager")

    AsyncFunction("setBlockStateAndReload") { (isActive: Bool, startNumber: Int, endNumber: Int, identifier: String, promise: Promise) in
      if let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker") {
        sharedDefaults.set(isActive, forKey: "isBlockActive")
        // Store as standard integers
        sharedDefaults.set(startNumber, forKey: "startNumber")
        sharedDefaults.set(endNumber, forKey: "endNumber")
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