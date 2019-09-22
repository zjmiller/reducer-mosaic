import { Content, PieceOfContent } from "../content";
import { ExportId, ExportWithContent } from "../export";

export const getAccessibleExportIds = (
  content: Content,
  containsExports: ExportId[],
  unlockedExports: ExportId[],
  availableExports: ExportWithContent[],
): ExportId[] => {
  let exportIds: ExportId[] = [];

  content.forEach((pieceOfContent: PieceOfContent) => {
    // check each piece of content to see if it's an import
    if (pieceOfContent.contentType === "IMPORT") {
      // if it's an import, add that export id
      const exportId = pieceOfContent.exportId;
      exportIds.push(exportId);

      // then check whether we should recursively check associated export's content
      if (
        containsExports.includes(exportId) ||
        unlockedExports.includes(exportId)
      ) {
        const exportWithContent = availableExports.find(
          e => e.exportId === exportId,
        );
        if (exportWithContent) {
          const nestedContent = exportWithContent.content;
          const nestedExportIds = getAccessibleExportIds(
            nestedContent,
            containsExports,
            unlockedExports,
            availableExports,
          );
          exportIds.push(...nestedExportIds);
        }
      }
    }
  });

  return exportIds;
};
