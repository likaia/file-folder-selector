export type fileDataType = {
  title: string;
  id: string;
  delStatus?: boolean;
  isSelect?: boolean;
  type: "folder" | "file";
  selectedTotal?: number;
  imgSrc?: string;
  childData?: Array<fileDataType>;
};

export type selectedFileType = { title: string; id: string; type: string };
