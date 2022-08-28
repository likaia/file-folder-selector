<template>
  <div class="content-panel">
    <file-select :file-data="data" @getSelectedFile="getFile" />
  </div>
</template>

<script lang="ts" setup>
import FileSelect from "@/plugins/components/file-select.vue";
import { fileDataType } from "@/plugins/type/ComponentType";

const data: fileDataType = {
  title: "My Files",
  id: "root",
  type: "folder",
  childData: [
    {
      title: "文件-1",
      id: "1",
      type: "file"
    },
    {
      title: "文件-2",
      id: "1",
      type: "file"
    }
  ]
};

const getFile = (value: Array<{ title: string; id: string; type: string }>) => {
  console.log(value);
};
</script>

<style scoped lang="scss">
.content-panel {
  width: 360px;
  height: 100%;
}
</style>
