/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = config => ({
  type: "call-directory",
  name: "SecondCallDirectory", // Must be unique
  bundleId: "com.jalexzzStudio.hkCallBlocker.SecondCallDirectory",
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.jalexzzStudio.hkCallBlocker"
    ]
  }
});