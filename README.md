# StreamDeck Plugin Distribution Action

StreamDeck Plugin Distribution Action

Test repo for building out a GitHub Action to build a Stream Deck Plugin for distribution.

Takes a `.sdPlugin` and converts it to a `.streamDeckPlugin`.

TODO: Get caching working (#3), it currently isn't finding it.

## Simple Example

`plugin_path` is the path to the `.sdPlugin` in your repo:

Need to think about that as it's currently joining `${process.env.GITHUB_WORKSPACE}\\${plugin_path}` i.e. the location of your code when you use `actions/checkout@v2`.

If you were to build it in a previous step, like when using the [StreamDeckToolkit](https://github.com/FritzAndFriends/StreamDeckToolkit) this would need to change.

```yml
    - name: StreamDeck Plugin Distribution
      id: sdpd
      uses: AlexHedley/streamdeckplugindistribution-test-action@v0.41
      with:
        plugin_path: src\com.elgato.counter.sdPlugin
```

There's one OUTPUT from the Action which is the `.streamDeckPlugin` path to use in other actions, like Upload Release.

```
    - name: Plugin Output Path
      run: echo "The plugin output path is '${{ steps.sdpd.outputs.plugin_output_path }}'"
```

## Full Sample

This includes uploading a GitHub Release

```yml
name: Build StreamDeck Plugin Distribution File

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: windows-latest 
    #runs-on: ubuntu-latest #not supported
    #runs-on: macos-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: StreamDeck Plugin Distribution
      id: sdpd
      uses: AlexHedley/streamdeckplugindistribution-test-action@v0.41
      with:
        plugin_path: src\com.elgato.counter.sdPlugin
    
    - name: Plugin Output Path
      run: echo "The plugin output path is '${{ steps.sdpd.outputs.plugin_output_path }}'"
      
    - name: Create Release
      id: create_release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: v0.1 #${{ github.ref }}
        release_name: Release v0.1 #${{ github.ref }}
        draft: true
        prerelease: false
    - name: Upload Release Asset
      id: upload-release-asset 
      uses: actions/upload-release-asset@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        upload_url: ${{ steps.create_release.outputs.upload_url }} # This pulls from the CREATE RELEASE step above, referencing it's ID to get its outputs object, which include a `upload_url`. See this blog post for more info: https://jasonet.co/posts/new-features-of-github-actions/#passing-data-to-future-steps 
        asset_path: ${{ steps.sdpd.outputs.plugin_output_path }}
        asset_name: com.elgato.counter.streamDeckPlugin
        asset_content_type: application/zip
```

### Exceptions

```
runs-on: windows-latest 
#runs-on: ubuntu-latest #not supported
#runs-on: macos-latest
```

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
