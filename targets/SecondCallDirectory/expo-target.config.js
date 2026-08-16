/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
export default config => ({
  type: "call-directory",
  deploymentTarget: "15.1",
  name: "SecondCallDirectory",
  bundleIdentifier: "com.jalexzzStudio.hkCallBlocker.SecondCallDirectory",
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.jalexzzStudio.hkCallBlocker"
    ]
  }
});