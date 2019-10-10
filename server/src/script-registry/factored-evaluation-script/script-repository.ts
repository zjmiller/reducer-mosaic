import * as _ from "lodash";

import { getInitialState } from "./get-initial-state";

import {
  FactoredEvaluationScript,
  FactoredEvaluationScriptHistory,
  SetupData,
} from "./index";

import { Action as ActionModel } from "../../db/models/action";
import { Script as ScriptModel } from "../../db/models/script";

export class ScriptDAO {
  constructor(private modelInstance: ScriptModel) {}

  public async saveActionToDb(action: any, index: number) {
    const actionModelInstance = await ActionModel.create({
      content: action,
      index,
    });

    await this.modelInstance.$add("action", actionModelInstance);
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

    const { randomSeedString, setupData } = scriptModel;

    const actions = await scriptModel.$get("actions");
    const sortedActions = _.sortBy(actions, "index");

    const history: FactoredEvaluationScriptHistory = {
      initialState: getInitialState(),
      actions: sortedActions,
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
