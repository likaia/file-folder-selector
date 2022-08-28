# file-folder-selector · [![npm](https://img.shields.io/badge/npm-v0.1.0-F37E42)](https://www.npmjs.com/package/file-folder-selector) [![yarn](https://img.shields.io/badge/yarn-v0.1.0-2081C1)](https://yarnpkg.com/package/file-folder-selector) [![github](https://img.shields.io/badge/GitHub-depositary-9A9A9A)](https://github.com/likaia/file-folder-selector) [![](https://img.shields.io/github/issues/likaia/file-folder-selector)](https://github.com/likaia/file-folder-selector/issues) [![](	https://img.shields.io/github/forks/likaia/file-folder-selector)](``https://github.com/likaia/file-folder-selector/network/members) [![](	https://img.shields.io/github/stars/likaia/file-folder-selector)](https://github.com/likaia/file-folder-selector/stargazers)
A file selection plugin implemented based on Vue 3, supports unlimited levels of folder nesting

The effect diagram is as follows: 
![](https://www.kaisir.cn/uploads/MarkDownImg/20220828/e0c583a61ae64142b50ec17620cd65a9.png)

## Plug-in installation
```bash
yarn add file-folder-selector

# or

npm install file-folder-selector --save
```

## Plug-in usage
Import the plugin in your business code where you need to use this plugin.
```html
<script setup lang="ts">
  import { FileSelect } from "file-folder-selector";
  // The style file of the component can be imported in the business code of the project or in the entry file of the project
  import "file-folder-selector/dist/style.css";
</script>
```
Just use it in `template`.
```html
<template>
  <file-select />
</template>
```

## Parameter Description
The plugin accepts 5 optional parameters:
* `fileData` file tree structure data
    * `title` file name, the value is of type **string**
    * `id` file id, The value is of type string
    * `type` file type, the value is "file" or "folder"
    * `imgSrc` File image address (optional parameter), the value is string type
    * `childData` Subfile data (optional parameter), the value is of type array. If the type is "folder", this parameter is passed, and the type of each item in the array is the type of `file Data`.
* `defaultFolderImage` The default folder icon, the value is of type string
* `defaultFileImage` The default file icon, the value is of type string
* `defaultSearchImage` The default search icon, the value is of type string
* `defaultFolderPathImage` The default folder path icon, the value is of type string
> Note: The default icon replacement of the plugin does not support images in svg format

The plugin provides 1 callback function:
* getSelectedFile Get the selected file, it has 1 parameter selectedArray, its value is `array` type, the type of each item in the array is: `{title: string; id: string; type: string }`

> For specific usage, please refer to the [file-select-test.vue](https://github.com/likaia/file-folder-selector/blob/master/src/test/file-select-test.vue) file in the source code.


## Write at the end
So far, all the methods of using the plug-in have been introduced.

I'm an amazing programmer, a front-end developer.

If you are interested in me, please go to my [personal website](https://www.kaisir.cn/)，learn more about。
