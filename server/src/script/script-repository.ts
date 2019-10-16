import { ScriptRepository as EstimationScriptRepository } from "../script-registry/estimation-script/repository";

import { Script as ScriptModel } from "../db/models/script";

export const ScriptRepository = {
  findByPk: async (pk: string) => {
    const script = await ScriptModel.findByPk(pk);
    if (!script) {
      throw Error("Script not found.");
    }

    if (script.scriptType === "ESTIMATION") {
      return await EstimationScriptRepository.findByPk(pk);
    }

    throw Error(`Script type ${script.scriptType} not recognized`);
  },
};
