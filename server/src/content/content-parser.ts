import { Content, PieceOfContent } from "./content";
import { ExportWithContent } from "./export";
import { Import } from "./import";
import { Text } from "./text";

export class ContentParser {
  private curPos = 0;
  private exportDepth = 0;
  private newExports: ExportWithContent[] = [];

  constructor(
    private str: string,
    private availablePointers: ExportWithContent[],
    private prngId: () => string,
  ) {}

  public parse(): Content {
    return this.parseContent();
  }

  public getNewPointers() {
    return this.newExports;
  }

  private parseContent(): Content {
    const contents: PieceOfContent[] = [];
    while (
      !this.isAtEnd() &&
      (!this.isInsideExport() || !this.isExportEnd(this.getCurChar()))
    ) {
      contents.push(this.parsePieceOfContent());
    }
    return contents;
  }

  private parsePieceOfContent(): PieceOfContent {
    const curChar = this.getCurChar();
    if (this.isExportStart(curChar)) {
      return this.parseExport();
    }

    if (this.isImportStart(curChar)) {
      return this.parseImport();
    }

    if (this.isTextChar(curChar)) {
      return this.parseText();
    }

    throw Error("Couldn't parse");
  }

  private parseText(): Text {
    let text = "";

    while (!this.isAtEnd() && this.isTextChar(this.getCurChar())) {
      text += this.getCurChar();
      this.moveToNextChar();
    }

    return {
      contentType: "TEXT" as "TEXT",
      text,
    };
  }

  private parseExport(): Import {
    this.moveToNextChar(); // eats [
    this.enterExport();

    const innerContent = this.parseContent();

    this.exitExport();
    this.moveToNextChar(); // eats ]

    const exportId = this.prngId();

    this.newExports.push({
      content: innerContent,
      exportId,
    });

    return {
      contentType: "IMPORT" as "IMPORT",
      exportId,
    };

    // return {
    //   contentType: "EXPORT" as "EXPORT",
    //   exportId,
    // };
  }

  private parseImport(): Import {
    this.moveToNextChar(); // eats $

    let pointerIndex = "";

    while (!this.isAtEnd() && !this.isImportEnd(this.getCurChar())) {
      pointerIndex += this.getCurChar();
      this.moveToNextChar();
    }

    return {
      contentType: "IMPORT" as "IMPORT",
      exportId: this.availablePointers[Number(pointerIndex) - 1].exportId,
    };
  }

  private moveToNextChar() {
    this.curPos++;
  }

  private getCurChar() {
    return this.str[this.curPos];
  }

  private isTextChar(c: string) {
    return (
      !this.isExportStart(c) &&
      !this.isImportStart(c) &&
      (!this.isInsideExport() || !this.isExportEnd(c))
    );
  }

  private isExportStart(c: string) {
    return c === "[";
  }

  private isExportEnd(c: string) {
    return c === "]";
  }

  private isImportStart(c: string) {
    return c === "$";
  }

  private isImportEnd(c: string) {
    return !/^[0-9]$/.test(c);
  }

  private enterExport() {
    this.exportDepth++;
  }

  private exitExport() {
    this.exportDepth--;
  }

  private isInsideExport() {
    return this.exportDepth > 0;
  }

  private isAtEnd() {
    return this.curPos >= this.str.length;
  }
}
