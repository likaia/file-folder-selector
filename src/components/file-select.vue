<template>
  <div>
    插件测试
  </div>
</template>

<script lang="ts" setup></script>

<style scoped lang="scss">
.main-content {
  width: 100%;
  height: 100%;
  background: var(--el-bg-color-h5SecMenu);

  .search-panel {
    width: 100%;
    height: 36px;
    margin: 15px 20px 10px 20px;
    display: flex;
  }

  .tips-panel {
    width: 100%;
    min-height: 30px;
    margin: 0 20px 10px 20px;
    background: #e0f1ff;
    border-radius: 8px;

    p {
      margin: 12px 18px 14px 15px;
      color: #333333;
    }
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
