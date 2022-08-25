export type bookcaseDataType = {
  title: string;
  id: string;
  delStatus?: boolean;
  isSelect: boolean;
  type: "folder" | "file";
  selectedTotal?: number;
  imgSrc?: string;
  childData?: Array<bookcaseDataType>;
};

export type selectedFileType = { title: string; id: string; type: string };
