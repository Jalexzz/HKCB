/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = config => ({
  type: "call-directory",
  deploymentTarget: "16.4",
  name: "FirstCallDirectory", // Must be unique
  bundleIdentifier: "com.jalexzzStudio.hkCallBlocker.FirstCallDirectory",
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.jalexzzStudio.hkCallBlocker.coaddata"
    ]
  }
});