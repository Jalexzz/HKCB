import ExpoModulesCore
import CallKit

public class MyCallManagerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyCallManager")

    // Update the arguments to include startNumber and endNumber
    AsyncFunction("setBlockStateAndReload") { (isActive: Bool, startNumber: Int, endNumber: Int, identifier: String, promise: Promise) in
      
      // Save state to App Group
      if let sharedDefaults = UserDefaults(suiteName: "group.com.jalexzzStudio.hkCallBlocker") {
        sharedDefaults.set(isActive, forKey: "isBlockActive")
        // Save the dynamic numbers
        sharedDefaults.set(startNumber, forKey: "startNumber")
        sharedDefaults.set(endNumber, forKey: "endNumber")
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