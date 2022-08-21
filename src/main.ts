import FileSelect from "@/components/file-select.vue";
import { App } from "vue";

export default {
  install(app: App): void {
    app.component(FileSelect.name, FileSelect);
  }
};
