# StreamDeck Plugin Distribution Action

StreamDeck Plugin Distribution Action

Test repo for building out a GitHub Action to build a Stream Deck Plugin for distribution.

---

Exporting your plugin for distribution  
https://developer.elgato.com/documentation/stream-deck/sdk/exporting-your-plugin/

## Mac
`DistributionTool -b -i com.elgato.counter.sdPlugin -o ~/Desktop/`

## Windows
`DistributionTool.exe -b -i com.elgato.counter.sdPlugin -o Release`

---

### Steps
- Download the *DistributionTool*
- Build an `.sdPlugin` - make this a config to the action so you pass in from another action i.e. build using StreamDeckToolkit, or exists in repo etc
- Create or check a folder exists (`-o`)
- Run tool
- Upload to GH Release
  - https://github.com/actions/upload-release-asset
- Distribute to Store
  - Distribution on the store
    - https://developer.elgato.com/documentation/stream-deck/sdk/distribution-on-the-store/
  - Distribution on your website
    - https://developer.elgato.com/documentation/stream-deck/sdk/distribution-on-your-website/

### Notes

GitHub Actions Toolkit
- https://github.com/actions/toolkit
  - tool-cache
  - https://github.com/actions/toolkit/tree/main/packages/tool-cache

Example:
```js
const tc = require('@actions/tool-cache');
const node12Path = await tc.downloadTool('https://nodejs.org/dist/v12.7.0/node-v12.7.0-linux-x64.tar.gz');
```

Possibly:
```js
if (process.platform === 'win32') {
  const distributionToolPath = await tc.downloadTool(' https://developer.elgato.com/documentation/stream-deck/distributiontool/DistributionToolWindows.zip');
  const distributionToolExtractedFolder = await tc.extractZip(distributionToolPath, 'path/to/extract/to');
}
else if (process.platform === 'darwin') {
  const distributionToolPath = await tc.downloadTool('https://developer.elgato.com/documentation/stream-deck/distributiontool/DistributionToolMac.zip');
  const distributionToolExtractedFolder = await tc.extractXar(distributionToolPath, 'path/to/extract/to');
}
else {
  // Linux?
}
```
