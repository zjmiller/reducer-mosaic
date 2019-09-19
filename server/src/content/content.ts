import { Export } from "./export";
import { Import } from "./import";
import { Text } from "./text";

export type PieceOfContent = Text | Export | Import;

export type Content = PieceOfContent[];
