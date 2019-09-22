import { Content } from "./Content";

export type ExportId = string;

export type Export = {
  exportId: string;
  contentType: "EXPORT";
};

export type ExportWithContent = {
  exportId: string;
  content: Content;
};

export type ExportMaybeWithContent = {
  exportId: string;
  content?: Content;
};
