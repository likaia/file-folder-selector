<template>
  <div class="main-content">
    <div class="search-panel">
      <input
        v-model="searchValue"
        type="text"
        @change.stop="searchData(searchValue)"
        placeholder="搜索文件"
      />
      <i class="icon" @click.stop="searchData(searchValue)">
        <search-icon v-if="!props.defaultSearchImage" />
        <img v-else :src="props.defaultSearchImage" alt="" />
      </i>
    </div>
    <div class="folder-list-panel">
      <div class="path-panel" v-if="folderPath.length > 1">
        <div
          class="item-panel"
          v-for="(item, index) in folderPath"
          @click.stop="folderBacktracking(item.id, index)"
          :title="item.folderName"
          :key="index"
        >
          <p>{{ item.folderName }}</p>
          <div class="icon-panel">
            <folder-path-icon v-if="!props.defaultFolderPathImage" />
            <img :src="props.defaultFolderPathImage" alt="" v-else />
          </div>
        </div>
      </div>
      <div class="btn-panel">
        <div class="select-panel">
          <input
            type="checkbox"
            @change.stop="selectAllFile(isSelectAll)"
            v-model="isSelectAll"
          />
        </div>
        <div class="title-panel">全选</div>
      </div>
      <div class="list-panel">
        <div
          class="item-panel"
          v-for="(item, index) in curFolderData"
          :key="index"
          v-show="getTreeNodeTotal(item) > 0 && !item.delStatus"
          @click.stop="selectFile(item)"
          @dblclick.stop="enterTheFolder(item)"
        >
          <div
            class="content-panel"
            :title="item.type === 'folder' ? '双击进入文件夹' : '单击选择文件'"
          >
            <div class="select-panel">
              <input
                type="checkbox"
                @change.stop="checkboxChange(item)"
                v-model="item.isSelect"
              />
            </div>
            <div class="icon-panel">
              <!-- 默认的文件夹图标 -->
              <folder-icon
                v-if="item.type === 'folder' && !props.defaultFolderImage"
              />
              <img
                :src="props.defaultFolderImage"
                alt=""
                v-if="item.type === 'folder' && props.defaultFolderImage"
              />
              <!-- 默认文件图标 -->
              <file-icon
                v-if="
                  item.type === 'file' &&
                    !item.imgSrc &&
                    !props.defaultFileImage
                "
              />
              <img
                :src="props.defaultFileImage"
                alt=""
                v-if="
                  item.type === 'file' && !item.imgSrc && props.defaultFileImage
                "
              />

              <!-- 文件图标 -->
              <img
                v-if="item.type === 'file' && item.imgSrc"
                :src="item.imgSrc"
                alt=""
              />
            </div>
            <div class="title-panel">{{ item.title }}</div>
          </div>
          <div class="options-panel" v-if="item.type === 'folder'">
            <div class="num-panel">
              <p>{{ item.selectedTotal ? item.selectedTotal : 0 }}</p>
              /
              <p>{{ getTreeNodeTotal(item) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="add-btn-panel">
      <button @click.stop="addFile">获取已选文件</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, shallowRef, ShallowRef } from "vue";
import { fileDataType, selectedFileType } from "@/type/ComponentType";
import Queue from "@/lib/Queue";
import fileConfig from "@/data/FileConfig.json";
import SearchIcon from "@/icons/search-icon.vue";
import FolderIcon from "@/icons/folder-icon.vue";
import FileIcon from "@/icons/file-icon.vue";
import FolderPathIcon from "@/icons/folder-path-icon.vue";

const searchValue: ShallowRef<string> = shallowRef("");
let folderTree: fileDataType = JSON.parse(JSON.stringify(fileConfig));
const curFolderData = ref<Array<fileDataType>>([]);
const folderPath = ref<Array<{ id: string; folderName: string }>>([
  { id: "root", folderName: "My Files" }
]);
const isSelectAll = shallowRef(false);

onMounted(() => {
  if (props.fileData) {
    folderTree = JSON.parse(JSON.stringify(props.fileData));
  }
  curFolderData.value = folderTree.childData as Array<fileDataType>;
});

const props = defineProps<{
  fileData?: {
    title: string;
    id: string;
    delStatus?: boolean;
    isSelect?: boolean;
    type: "folder" | "file";
    selectedTotal?: number;
    imgSrc?: string;
    childData?: Array<fileDataType>;
  };
  defaultFolderImage?: string;
  defaultFileImage?: string;
  defaultSearchImage?: string;
  defaultFolderPathImage?: string;
}>();

const emit = defineEmits<{
  (
    e: "getSelectedFile",
    selectedIdArray: Array<{ title: string; id: string; type: string }>
  ): void;
}>();

const searchData = (value: string) => {
  const result = searchFileOfTree(value);
  if (value.replace(/\s*/g, "") === "") {
    curFolderData.value = folderTree.childData as Array<fileDataType>;
    return;
  }
  curFolderData.value = result;
};

const checkboxChange = (item: fileDataType) => {
  if (item.type === "file") {
    return;
  }
  selectFile(item, true);
};

const selectFile = (item: fileDataType, isCheckbox = false) => {
  // 重置全选状态
  isSelectAll.value = false;
  // item点击时文件夹不参与单击选中
  if (!isCheckbox && item.type === "folder") {
    return;
  }
  if (isCheckbox && item.type === "folder") {
    // 获取文件夹下的所有文件
    const folderChildData = searchTreeFolderNode(folderTree, item.id);
    // 通过深度优先搜索选中所有文件
    const stack = [folderChildData];
    while (stack.length > 0) {
      // 取出栈顶元素
      const stackTop = stack.pop();
      if (stackTop) {
        // 继续搜索子节点
        if (stackTop.childData && stackTop.childData.length) {
          stack.push(...[...stackTop.childData].reverse());
        }
        // 更新文件选中状态
        stackTop.isSelect = item.isSelect;
      }
    }
    item.isSelect = !item.isSelect;
    // 更新当前层已选文件总数
    updateSelectedFileTotal(item, isCheckbox);
    return;
  }
  item.isSelect = !item.isSelect;
  if (!folderTree) return;
  // 获取当前层节点
  const curLevelData = searchTreeFolderNode(
    folderTree,
    folderPath.value[folderPath.value.length - 1].id
  );
  if (curLevelData) {
    // 更新选中的节点
    updateSelectedFileTotal(curLevelData);
  }
};

// 选中当前节点下的所有文件
const selectAllFile = (value: string | number | boolean) => {
  if (!folderTree) return;
  const folderID = folderPath.value[folderPath.value.length - 1].id;
  let curLevelData = searchTreeFolderNode(folderTree, folderID);
  // 选中根节点
  if (curLevelData == null && folderID === "root") {
    curLevelData = folderTree;
  }
  const stack = [curLevelData];
  while (stack.length > 0) {
    // 取出栈顶元素
    const stackTop = stack.pop();
    if (stackTop) {
      // 更新选中状态
      stackTop.isSelect = value as boolean;
      if (stackTop.childData && stackTop.childData.length) {
        stack.push(...[...stackTop.childData].reverse());
      }
    }
  }
  // 更新当前层文件选中状态
  if (curLevelData && curLevelData.childData) {
    curFolderData.value = [];
    curFolderData.value = curLevelData.childData;
  }
  // 搜索子文件夹并更新已选文件总数
  if (curLevelData && curLevelData.childData) {
    for (let i = 0; i < curLevelData.childData.length; i++) {
      const childItem = curLevelData.childData[i];
      if (childItem.type === "folder") {
        const curHierarchyData = searchTreeFolderNode(childItem, childItem.id);
        if (curHierarchyData) {
          updateSelectedFileTotal(curHierarchyData);
        }
      }
    }
  }
};

// 进入文件夹
const enterTheFolder = (item: fileDataType) => {
  // 重置全选状态
  isSelectAll.value = false;
  if (item.type === "folder" && item.childData) {
    curFolderData.value = item.childData;
    folderPath.value.push({ folderName: item.title, id: item.id });
    // 搜索子文件夹并更新已选文件总数
    for (let i = 0; i < item.childData.length; i++) {
      const childItem = item.childData[i];
      if (childItem.type === "folder") {
        const curHierarchyData = searchTreeFolderNode(childItem, childItem.id);
        if (curHierarchyData) {
          updateSelectedFileTotal(curHierarchyData);
        }
      }
    }
    return;
  }
  if (item.type === "folder") {
    console.log("此文件夹为空");
  }
};

const addFile = () => {
  const selectedFile = getSelectedFiles(folderTree);
  delSelectedNode();
  emit("getSelectedFile", selectedFile);
};

// 删除已选文件
const delSelectedNode = () => {
  const stack = [folderTree];
  while (stack.length !== 0) {
    // 取出栈顶元素
    const stackTop = stack.pop();
    if (stackTop) {
      // 继续搜索子节点
      if (stackTop.childData && stackTop.childData.length) {
        stack.push(...[...stackTop.childData].reverse());
      }
      if (stackTop.isSelect) {
        stackTop.delStatus = true;
      }
    }
  }
  curFolderData.value = [];
  if (folderTree.childData) {
    curFolderData.value = folderTree.childData;
  }
};
const getSelectedFiles = (tree: fileDataType): Array<selectedFileType> => {
  const files: Array<selectedFileType> = [];
  const stack = [tree];
  while (stack.length > 0) {
    // 取出栈顶元素
    const stackTop = stack.pop();
    if (stackTop) {
      // 继续搜索子节点
      if (stackTop.childData && stackTop.childData.length) {
        stack.push(...[...stackTop.childData].reverse());
      }
      if (stackTop.isSelect && stackTop.type === "file") {
        files.push({
          id: stackTop.id,
          title: stackTop.title,
          type: stackTop.type
        });
      }
    }
  }

  return files;
};

// 路径回退
const folderBacktracking = (folderId: string, pathIndex: number) => {
  // 重置全选状态
  isSelectAll.value = false;
  // 回溯到根节点
  if (folderId === "root" && typeof folderTree !== "undefined") {
    if (folderTree?.childData) {
      curFolderData.value = folderTree.childData;
    }
    folderPath.value = [{ id: "root", folderName: "My Files" }];
    // 搜索子文件夹并更新已选文件总数
    if (folderTree && folderTree.childData) {
      for (let i = 0; i < folderTree.childData.length; i++) {
        const childItem = folderTree.childData[i];
        if (childItem.type === "folder") {
          const curHierarchyData = searchTreeFolderNode(
            childItem,
            childItem.id
          );
          if (curHierarchyData) {
            updateSelectedFileTotal(curHierarchyData);
          }
        }
      }
    }
    return;
  }
  // 回溯到指定节点
  if (folderTree?.childData) {
    const resultChild = searchTreeFolderNode(folderTree, folderId);
    if (resultChild && resultChild.childData) {
      curFolderData.value = resultChild.childData;
      // 搜索子文件夹并更新已选文件总数
      if (resultChild && resultChild.childData) {
        for (let i = 0; i < resultChild.childData.length; i++) {
          const childItem = resultChild.childData[i];
          if (childItem.type === "folder") {
            const curHierarchyData = searchTreeFolderNode(
              childItem,
              childItem.id
            );
            if (curHierarchyData) {
              updateSelectedFileTotal(curHierarchyData);
            }
          }
        }
      }
      // 计算路径回退步数
      const stepBack = folderPath.value.length - pathIndex;
      // 不回退根节点
      for (let i = stepBack; i > 1; i--) {
        folderPath.value.pop();
      }
      return;
    }
    console.error("节点搜索失败，未找到对应的文件树");
    return;
  }
  console.error("书橱数据异常");
};

// 获取节点总数
const getTreeNodeTotal = (tree: fileDataType) => {
  const stack = [tree];
  let total = 0;
  while (stack.length !== 0) {
    // 取出栈顶元素
    const stackTop = stack.pop();
    if (stackTop) {
      // 继续搜索子节点
      if (stackTop.childData && stackTop.childData.length) {
        stack.push(...[...stackTop.childData].reverse());
      }
      // 只计算file类型的节点总数
      if (stackTop.type === "file") {
        total++;
      }
    }
  }
  return total;
};

// 更新已选择文件总数
const updateSelectedFileTotal = (tree: fileDataType, isCheckbox = false) => {
  const queue = new Queue<fileDataType>();
  queue.enqueue(tree);
  // 使用广度优先搜索获取已选择的文件
  let selectedTotal = 0;
  while (!queue.isEmpty()) {
    const len = queue.size();
    for (let i = 0; i < len; i++) {
      // 获取当前层节点
      const teamLeader = queue.peek();
      if (teamLeader) {
        if (teamLeader.isSelect && teamLeader.type === "file") {
          selectedTotal++;
        }
        // 将下一层入队
        if (teamLeader.childData && teamLeader.childData.length) {
          teamLeader.childData.map(item => {
            queue.enqueue(item);
          });
        }
        // 删除遍历过的节点
        queue.dequeue();
      }
    }
  }
  // 更新当前层已选总数
  tree.selectedTotal = selectedTotal;
  // 获取当前层节点总数
  const curNodeTotal = getTreeNodeTotal(tree);
  // 空文件夹复选框选中
  if (isCheckbox && curNodeTotal === 0) {
    tree.isSelect = !tree.isSelect;
    return;
  }
  if (curNodeTotal > 0) {
    tree.isSelect = tree.selectedTotal === curNodeTotal;
  }
};

// 深度优先搜索指定文件
const searchFileOfTree = (fileTitle: string) => {
  const stack = [folderTree];
  const searchResult = [];
  while (stack.length !== 0) {
    // 取出栈顶元素
    const stackTop = stack.pop();
    if (stackTop) {
      // 继续搜索子节点
      if (stackTop.childData && stackTop.childData.length) {
        stack.push(...[...stackTop.childData].reverse());
      }
      if (stackTop.title.toLowerCase().includes(fileTitle.toLowerCase())) {
        searchResult.push(stackTop);
      }
    }
  }
  return searchResult;
};

// 深度优先搜索文件树节点
const searchTreeFolderNode = (
  tree: fileDataType,
  key: string
): fileDataType | null | undefined => {
  const stack = [tree];
  while (stack.length !== 0) {
    // 取出栈顶元素
    const stackTop = stack.pop();
    if (stackTop) {
      // 继续搜索子节点
      if (stackTop.childData && stackTop.childData.length) {
        /**
         * 将子结点入栈：
         * 1. 使用扩展运算符取出参数对象,使用reverse方法将数组中的元素进行颠倒
         * 2. 使用扩展运算符取出颠倒后数组中的对象
         * 3. 将取出的对象放进栈中
         */
        stack.push(...[...stackTop.childData].reverse());
      }
      if (stackTop.id === key) {
        return stackTop;
      }
    }
  }
  return null;
};
</script>

<style scoped lang="scss">
.main-content {
  width: 100%;
  height: 100%;
  background: #ffffff;
  user-select: none;
  font-size: 14px;

  .search-panel {
    width: 100%;
    height: 36px;
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    input {
      width: 100%;
      height: 36px;
      border: none;
      outline: none;
      background: #eeeeee;
      border-radius: 8px;
      box-sizing: border-box;
      padding-left: 10px;
      padding-right: 30px;
    }

    .icon {
      cursor: pointer;
      display: inline-block;
      height: 16px;
      width: 16px;
      background-repeat: no-repeat;
      position: absolute;
      right: 10px;
      z-index: 2;

      img {
        width: 100%;
        height: 100%;
      }
    }
  }

  .folder-list-panel {
    width: 100%;
    height: calc(100% - 92px);
    margin-bottom: 10px;

    // 文件夹
    .path-panel {
      width: 100%;
      min-height: 15px;
      display: flex;
      align-items: center;

      .item-panel {
        min-width: 50px;
        height: 15px;
        display: flex;
        align-items: center;

        p {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 12px;
          color: #999999;
          cursor: pointer;
        }

        .icon-panel {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 7px;
          height: 5px;
          margin: 0 8px;

          img {
            width: 100%;
            height: 100%;
          }
        }

        &:first-child {
          p {
            color: #333333;
            font-weight: 500;
          }
        }

        &:last-child {
          p {
            cursor: default;
          }
          .icon-panel {
            display: none;
          }
        }
      }
    }

    // 全选按钮容器
    .btn-panel {
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      margin: 10px 0;
      border-bottom: solid 1px #eeeeee;

      .select-panel {
        width: 16px;
        height: 16px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .title-panel {
        min-width: 53px;
        margin-left: 9px;
      }
    }

    .list-panel {
      width: 100%;
      min-height: 68px;

      .item-panel {
        width: 100%;
        height: 68px;
        border-bottom: solid 1px #eeeeee;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &.checked {
          background: #eeeeee;
        }

        .content-panel {
          cursor: pointer;
          display: flex;
          align-items: center;

          .select-panel {
            width: 16px;
            height: 16px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;

            .checkbox-panel::before {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              content: "";
              background: #dbdbdb;
              border-radius: 4px;
            }

            .checkbox-panel:checked::before {
              content: "\2713";
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border-radius: 4px;
              font-size: 14px;
              color: #ffffff;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #0075ff;
            }

            .checkbox-panel {
              appearance: none;
              cursor: pointer;
            }
          }
          .icon-panel {
            width: 32px;
            min-height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-left: 10px;

            img {
              width: 100%;
              height: 100%;
            }
          }
          .title-panel {
            min-width: 43px;
            max-width: 98px;
            min-height: 15px;
            margin-left: 9px;
            text-align: left;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
          }
        }

        .options-panel {
          display: flex;
          align-items: center;
          margin-right: 7px;

          .price-panel {
            min-width: 60px;
            height: 22px;
            background: #fff0ed;
            color: #ef4e2f;
            display: flex;
            border-radius: 66px;
            font-weight: 400;
            justify-content: center;
            align-items: center;
          }

          .is-public-panel {
            width: 12px;
            height: 12px;
            display: flex;
            align-items: center;
            margin-left: 8px;
            margin-right: 12px;
            cursor: pointer;

            img {
              width: 100%;
              height: 100%;
            }
          }

          .num-panel {
            min-width: 35px;
            height: 15px;
            display: flex;
            align-items: center;
            color: #999999;
            font-weight: 500;
          }
        }
      }
    }
  }

  .add-btn-panel {
    height: 36px;
    margin-bottom: 10px;

    button {
      width: 100%;
      height: 100%;
      background: #0099ff;
      position: relative;
      border: none;
      color: #ffffff;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      line-height: 1;
      white-space: nowrap;
      cursor: pointer;
      text-align: center;
      box-sizing: border-box;
      outline: 0;
      transition: 0.1s;
      user-select: none;
      vertical-align: middle;
      border-radius: 4px;

      &:hover {
        background: #0c85ff;
      }

      &:active {
        background: #0078ff;
      }
    }
  }
}
</style>
