/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = config => ({
  type: "call-directory",
  deploymentTarget: "15.1",
  name: "SecondCallDirectory", // Must be unique
  bundleIdentifier: ".SecondCallDirectory",
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.jalexzzStudio.hkCallBlocker"
    ]
  }
});