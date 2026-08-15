/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = config => ({
  type: "call-directory",
  name: "FirstCallDirectory", // Must be unique
  bundleId: "com.jalexzzStudio.hkCallBlocker.FirstCallDirectory",
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.jalexzzStudio.hkCallBlocker"
    ]
  }
});