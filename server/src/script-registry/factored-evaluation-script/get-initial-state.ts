import { Experts } from "./index";
import {
  JudgeWorkspace,
  HonestWorkspace,
  MaliciousWorkspace,
} from "./workspace";
import { ExportWithContent } from "../../content/export";

export const getInitialState = () => ({
  availableExports: [] as ExportWithContent[],
  experts: { honest: [], malicious: [] } as Experts,
  honestWorkspaces: [] as HonestWorkspace[],
  judgeWorkspaces: [] as JudgeWorkspace[],
  maliciousWorkspaces: [] as MaliciousWorkspace[],
});
