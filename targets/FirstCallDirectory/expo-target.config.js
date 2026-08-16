/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
export default config => ({
  type: "call-directory",
  deploymentTarget: "15.1",
  name: "FirstCallDirectory", // Must be unique
  bundleIdentifier: "com.jalexzzStudio.hkCallBlocker.FirstCallDirectory",
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.jalexzzStudio.hkCallBlocker"
    ]
  }
});