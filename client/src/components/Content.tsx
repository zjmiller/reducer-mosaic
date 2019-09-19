import React, { useState } from "react";

interface ContentProps {
  content: any;
  availableExports: any;
  unlockExport?: any;
}

interface PieceOfContentProps {
  pieceOfContent: any;
  availableExports: any;
  unlockExport?: any;
}

interface ImportProps {
  importData: any;
  availableExports: any;
  unlockExport?: any;
}

const PieceOfContent: React.FC<PieceOfContentProps> = ({
  pieceOfContent,
  availableExports,
  unlockExport
}) => {
  if (pieceOfContent.contentType === "TEXT") {
    return <Text textData={pieceOfContent} />;
  }

  if (pieceOfContent.contentType === "EXPORT") {
    return (
      <Export exportData={pieceOfContent} availableExports={availableExports} />
    );
  }

  if (pieceOfContent.contentType === "IMPORT") {
    return (
      <Import
        importData={pieceOfContent}
        availableExports={availableExports}
        unlockExport={unlockExport}
      />
    );
  }

  return null;
};

const Text: React.FC<any> = ({ textData }) => {
  return <span>{textData.text}</span>;
};

const Import: React.FC<ImportProps> = ({
  importData,
  availableExports,
  unlockExport
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // the backend sends content when and only when export is unlocked
  // this could maybe come apart? would need to complicate architecture
  // in this case
  const isLocked = !availableExports.find(
    (e: any) => e.exportId === importData.exportId
  ).content;

  const pointerNumber =
    availableExports.findIndex((e: any) => e.exportId === importData.exportId) +
    1;

  if (!isOpen) {
    return (
      <span
        onClick={e => {
          if (isLocked) {
            unlockExport && unlockExport(importData.exportId);
          } else {
            setIsOpen(true);
          }
          e.stopPropagation();
        }}
        style={{
          backgroundColor: "#05a",
          borderRadius: "3px",
          color: "#fff",
          cursor: "pointer",
          padding: "1px 4px",
          whiteSpace: "nowrap"
        }}
      >
        {isLocked && "🔒"}${pointerNumber}
      </span>
    );
  }

  const exportWithContent = availableExports.find(
    (e: any) => e.exportId === importData.exportId
  );

  return (
    <span
      onClick={e => {
        setIsOpen(false);
        e.stopPropagation();
      }}
      style={{
        backgroundColor: "lightBlue",
        borderRadius: "3px",
        cursor: "pointer",
        padding: "1px"
      }}
    >
      <span
        style={{
          backgroundColor: "#05a",
          borderRadius: "3px 0 0 3px",
          color: "#fff",
          marginRight: "0 3px 0 1px",
          padding: "1px 4px",
          whiteSpace: "nowrap"
        }}
      >
        ${pointerNumber}
      </span>
      <span
        style={{
          color: "#05a",
          fontSize: "18px",
          fontWeight: 600,
          margin: "0 3px 0 1px"
        }}
      >
        [
      </span>
      <Content
        content={exportWithContent.content}
        availableExports={availableExports}
        unlockExport={unlockExport}
      />
      <span
        style={{
          color: "#05a",
          fontSize: "18px",
          fontWeight: 600,
          margin: "0 1px 0 3px"
        }}
      >
        ]
      </span>
    </span>
  );
};

const Export: React.FC<any> = ({ exportData, availableExports }) => {
  const exportWithContent = availableExports.find(
    (e: any) => e.exportId === exportData.exportId
  );

  if (!exportWithContent || !exportWithContent.content) {
    return (
      <span style={{ backgroundColor: "red" }}>export content not found</span>
    );
  }

  return (
    <span style={{ backgroundColor: "green" }}>
      [
      <Content
        content={exportWithContent.content}
        availableExports={availableExports}
      />
      ]
    </span>
  );
};

export const Content: React.FC<ContentProps> = ({
  content,
  availableExports,
  unlockExport
}) => {
  return (
    <span>
      {content.map((pieceOfContent: any, i: number) => (
        <PieceOfContent
          key={i}
          pieceOfContent={pieceOfContent}
          availableExports={availableExports}
          unlockExport={unlockExport}
        />
      ))}
    </span>
  );
};
