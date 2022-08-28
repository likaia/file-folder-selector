# file-folder-selector · [![npm](https://img.shields.io/badge/npm-v1.0.0-F37E42)](https://www.npmjs.com/package/file-folder-selector) [![yarn](https://img.shields.io/badge/yarn-v1.0.0-2081C1)](https://yarnpkg.com/package/file-folder-selector) [![github](https://img.shields.io/badge/GitHub-depositary-9A9A9A)](https://github.com/likaia/file-folder-selector) [![](https://img.shields.io/github/issues/likaia/file-folder-selector)](https://github.com/likaia/file-folder-selector/issues) [![](	https://img.shields.io/github/forks/likaia/file-folder-selector)](``https://github.com/likaia/file-folder-selector/network/members) [![](	https://img.shields.io/github/stars/likaia/file-folder-selector)](https://github.com/likaia/file-folder-selector/stargazers)
基于Vue3实现的文件选择插件，支持无限层次的文件夹嵌套

English documents please move: [README-EN.md](README-EN.md)

效果图如下：
![效果图](https://www.kaisir.cn/uploads/MarkDownImg/20220828/e0c583a61ae64142b50ec17620cd65a9.png)


## 插件安装
```bash
yarn add file-folder-selector

# or

npm install file-folder-selector --save
```

## 插件使用
在你需要使用此插件的业务代码中导入插件。
```html
<script setup lang="ts">
  import { FileSelect } from "file-folder-selector";
  // 组件的样式文件，可以在项目的业务代码内导入，也可以在项目的入口文件导入
  import "file-folder-selector/dist/style.css";
</script>
```
在`template`中使用即可。
```html
<template>
  <file-select />
</template>
```

## 参数说明
插件接收5个可选参数：
* `fileData` 文件树结构数据
  * `title` 文件名, 值为**string** 类型
  * `id` 文件id, 值为**string** 类型
  * `type` 文件类型, 值为"file"或"folder"
  * `imgSrc` 文件图片地址（可选参数），值为**string** 类型
  * `childData` 子文件数据（可选参数），值为**array**类型，如果type为"folder"，则传此参数，数组中的每一项类型就为`fileData`的类型。
* `defaultFolderImage` 默认的文件夹图标，值为**string** 类型
* `defaultFileImage` 默认的文件图标，值为**string** 类型
* `defaultSearchImage` 默认的搜索图标，值为**string** 类型
* `defaultFolderPathImage` 默认的文件夹路径图标，值为**string** 类型
> 注意：插件默认的图标更换不支持svg格式的图片，插件的`fileData`参数可参考源码中的[FileConfig.json](src/data/FileConfig.json)文件

插件提供了1个回调函数：
* getSelectedFile 获取已选择的文件，它有1个参数**selectedArray**，它值为`array`类型，数组中的每一项类型为：`{title: string; id: string; type: string }`

> 具体的使用方法可以参考源码中的 [file-select-test.vue](src/test/file-select-test.vue) 文件。


## 写在最后
至此，插件的所有使用方法就介绍完了。

我是**神奇的程序员**，一位前端开发工程师。

如果你对我感兴趣，请移步我的[个人网站](https://www.kaisir.cn/)，进一步了解。
