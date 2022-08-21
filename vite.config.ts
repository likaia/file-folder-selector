import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 8020,
    proxy: {}
  },
  resolve: {
    // 设置路径别名
    alias: {
      "@": resolve(__dirname, "./src"),
      "*": resolve("")
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "fileFolderSelector",
      // 仅输出CommonJS和umd规范的文件
      formats: ["umd", "cjs"],
      fileName: "file-folder-selector"
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue"
        }
      }
    }
  }
});
