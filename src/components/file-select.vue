<template>
  <div class="main-content">
    <div class="search-panel">
      <input v-model="searchValue" @change="searchData" placeholder="Search" />
    </div>
    <div class="folder-list-panel">
      <div class="top-panel">
        <div class="path-panel" v-if="folderPath.length > 1">
          <div
            class="item-panel"
            v-for="(item, index) in folderPath"
            @click.stop="folderBacktracking(item.id, index)"
            :key="index"
          >
            <p>{{ item.folderName }}</p>
            <div class="icon-panel">
              <svg
                width="5"
                height="7"
                viewBox="0 0 5 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 1.00195L0 5.51122C0 6.37699 1.02544 6.83368 1.66897 6.25451L4.17412 3.99988C4.6155 3.60264 4.6155 2.91053 4.17412 2.51329L1.66896 0.258653C1.02544 -0.320518 0 0.136176 0 1.00195Z"
                  fill="#999999"
                />
              </svg>
            </div>
          </div>
        </div>
        <div class="btn-panel">
          <div class="select-panel">
            <input
              type="checkbox"
              @change="selectAllBook"
              v-model="isSelectAll"
            />
          </div>
          <div class="title-panel">全选</div>
        </div>
      </div>
      <div class="list-panel">
        <div
          class="item-panel"
          v-for="(item, index) in curFolderData"
          :key="index"
          v-show="getTreeNodeTotal(item) > 0"
          @click.stop="selectFile(item)"
          @dblclick.stop="enterTheFolder(item)"
        >
          <div class="content-panel">
            <div class="select-panel">
              <div class="select-panel">
                <input
                  type="checkbox"
                  @change="selectFile(item, true)"
                  v-model="item.isSelect"
                />
              </div>
            </div>
            <div class="icon-panel">
              <svg
                v-if="item.type === 'folder'"
                width="32"
                height="28"
                viewBox="0 0 32 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 3C0 1.34314 1.34315 0 3 0H11.5406C12.1874 0 12.7943 0.312765 13.1695 0.839526L17.1429 6.41667H0V3Z"
                  fill="#0088FF"
                />
                <path
                  d="M0 6H29C30.6569 6 32 7.34315 32 9V25.0001C32 26.6569 30.6569 28.0001 29 28.0001H3C1.34315 28.0001 0 26.6569 0 25.0001V6Z"
                  fill="#B3DDFE"
                />
              </svg>
              <img :src="item.imgSrc" alt="" v-else />
            </div>
            <div class="title-panel">{{ item.title }}</div>
          </div>
          <div class="options-panel" v-if="item.type === 'folder'">
            <div class="num-panel">
              <p>{{ item.selectedTotal }}</p>
              /
              <p>{{ getTreeNodeTotal(item) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="add-btn-panel">
      <button @click="addBook">获取已选文件</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, shallowRef, ShallowRef } from "vue";
import { bookcaseDataType, selectedFileType } from "@/type/ComponentType";
import fileConfig from "@/data/FileConfig.json";
import Queue from "@/lib/Queue";

const searchValue: ShallowRef<string> = shallowRef("");
let folderTree: bookcaseDataType = JSON.parse(JSON.stringify(fileConfig));
const curFolderData = ref<Array<bookcaseDataType>>([]);
const folderPath = ref<Array<{ id: string; folderName: string }>>([
  { id: "root", folderName: "My Files" }
]);
const isSelectAll = shallowRef(false);

onMounted(() => {
  if (props.fileData) {
    folderTree = JSON.parse(JSON.stringify(props.fileData));
  }
  curFolderData.value = folderTree.childData as Array<bookcaseDataType>;
});

const props = defineProps<{
  fileData: {
    title: string;
    id: string;
    delStatus?: boolean;
    isSelect?: boolean;
    type: "folder" | "file";
    selectedTotal?: number;
    imgSrc?: string;
    childData?: Array<bookcaseDataType>;
  };
  defaultFolderImage: string;
  defaultFileImage: string;
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
    curFolderData.value = folderTree.childData as Array<bookcaseDataType>;
    return;
  }
  curFolderData.value = result;
};

const selectFile = (item: bookcaseDataType, isCheckbox = false) => {
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
const selectAllBook = (value: string | number | boolean) => {
  if (folderTree) return;
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
const enterTheFolder = (item: bookcaseDataType) => {
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

const addBook = () => {
  const selectedFile = getSelectedBooks(folderTree);
  emit("getSelectedFile", selectedFile);
};
const getSelectedBooks = (tree: bookcaseDataType): Array<selectedFileType> => {
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
const getTreeNodeTotal = (tree: bookcaseDataType) => {
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
const updateSelectedFileTotal = (
  tree: bookcaseDataType,
  isCheckbox = false
) => {
  const queue = new Queue<bookcaseDataType>();
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
const searchFileOfTree = (bookTitle: string) => {
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
      if (stackTop.title === bookTitle) {
        searchResult.push(stackTop);
      }
    }
  }
  return searchResult;
};

// 深度优先搜索文件树节点
const searchTreeFolderNode = (
  tree: bookcaseDataType,
  key: string
): bookcaseDataType | null | undefined => {
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
  background: greenyellow;

  .search-panel {
    width: 100%;
    height: 36px;
    margin: 15px 20px 10px 20px;
    display: flex;
  }

  .folder-list-panel {
    width: 100%;
    height: calc(100% - 210px);
    margin: 0 20px 10px 20px;

    // 文件夹
    .top-panel {
      width: 100%;

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
          margin-left: 7px;
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
          display: flex;
          align-items: center;

          .select-panel {
            width: 16px;
            height: 16px;
            margin-left: 7px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
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
            max-height: 36px;
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
    width: 100%;
    height: 36px;
    margin: 0 20px 10px 20px;

    .icon-panel {
      position: absolute;
      right: 20px;
    }
  }
}
</style>
