# webpack-unused-files-plugin

find unused files from your project.

## Usage

> yarn add webpack-unused-files-plugin

or

> npm install webpack-unused-files-plugin


```js
const WebpackUnusedFilesPlugin = require('webpack-unused-files-plugin');

// webpack config
module.exports = {
  plugins: [
    new WebpackUnusedFilesPlugin(options),
  ]
}
```

## Options

```js
const defaultOptions = {
  context: '',
  patterns: [
    "!**/node_modules",
    "!**/(test|tests)/**"
  ],
  sort: null, // 'ext'
  strict: false,
}
```

|options|type|describe|default|required|
|-- |-- |-- |-- |-- |
|context|string|target folder|webpack.context|false|
|patterns|[]string|glob patterns| `!**/node_modules !**/test` |false|
|sort|any|how to display unused files, `ext` will sort files by extension|null|false|
|strict|boolean|throw an error when plugin find unused file|false|false|


## Example

```js
config = {
  plugins: [
    new WebpackUnusedFilesPlugin({
      context: path.join(__dirname, 'src'), // find basic at src directory
      patterns: [ // NOTE: plugin will extend .gitignore
        "!**/*.log"
      ],
      sort: "ext", // plugin will sort unused file by file extenstion
      strict: true, // webpack compilcation build failed with an error
    }),
  ],
}
```
