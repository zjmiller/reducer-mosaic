import { getInitialState } from "./get-initial-state";

import {
  FactoredEvaluationScript,
  FactoredEvaluationScriptHistory,
  SetupData,
} from "./index";

import { Script as ScriptModel } from "../../db/models/script";

export class ScriptDAO {
  constructor(private modelInstance: ScriptModel) {}

  public async saveActionToDb() {
    await this.modelInstance.update({ actions: this.modelInstance.actions });
  }
}

const scripts: FactoredEvaluationScript[] = [];

export const FactoredEvaluationScriptRepository = {
  async create({
    setupData,
    history,
    randomSeedString,
  }: {
    setupData: SetupData;
    history?: FactoredEvaluationScriptHistory;
    randomSeedString?: string;
  }): Promise<FactoredEvaluationScript> {
    randomSeedString = randomSeedString || String(Date.now());

    history = history || {
      actions: [],
      initialState: getInitialState(),
    };

    const scriptModel = await ScriptModel.create({
      randomSeedString,
      scriptType: "FACTORED_EVALUATION",
      initialState: history.initialState,
      actions: history.actions,
    });

    const scriptDAO = new ScriptDAO(scriptModel);

    const script = new FactoredEvaluationScript({
      id: scriptModel.id,
      setupData,
      history,
      randomSeedString,
      scriptDAO,
    });

    scripts.push(script);

    return Promise.resolve(script);
  },

  async findByPk(pk: string) {
    const cachedScript = scripts.find(s => s.id === pk);
    if (cachedScript) {
      return cachedScript;
    }

    const scriptModel = await ScriptModel.findByPk(pk);
    if (!scriptModel) {
      throw Error("Script not found");
    }

    const { randomSeedString, setupData, actions } = scriptModel;

    const history: FactoredEvaluationScriptHistory = {
      initialState: getInitialState(),
      actions,
    };

    const scriptDAO = new ScriptDAO(scriptModel);

    const script = new FactoredEvaluationScript({
      id: scriptModel.id,
      setupData,
      history,
      randomSeedString,
      scriptDAO,
    });

    scripts.push(script);

    return Promise.resolve(script);
  },
};
