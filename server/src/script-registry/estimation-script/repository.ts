import * as _ from "lodash";

import { Action as ActionModel } from "../../db/models/action";
import { Script as ScriptModel } from "../../db/models/script";

import { Script } from "./estimation-script";
import { getInitialState } from "./initial-state";
import { History, SetupData } from "./types";

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

const scripts: any[] = [];

export const ScriptRepository = {
  async create({
    setupData,
    history,
    randomSeedString,
  }: {
    setupData: SetupData;
    history?: History;
    randomSeedString?: string;
  }): Promise<Script> {
    randomSeedString = randomSeedString || String(Date.now());

    history = history || {
      actions: [],
      initialState: getInitialState(),
    };

    const scriptModel = await ScriptModel.create({
      actions: history.actions,
      randomSeedString,
      scriptType: "ESTIMATION",
      setupData,
    });

    const scriptDAO = new ScriptDAO(scriptModel);

    const script = new Script({
      id: scriptModel.id,
      history,
      randomSeedString,
      scriptDAO,
      setupData,
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
    const sortedActions = _.sortBy(actions, "index") as ActionModel[];
    const sortedActionsWithoutMetadata = sortedActions.map(a => a.content);

    const history: any = {
      initialState: getInitialState(),
      actions: sortedActionsWithoutMetadata,
    };

    const scriptDAO = new ScriptDAO(scriptModel);

    const script = new Script({
      id: scriptModel.id,
      history,
      randomSeedString,
      scriptDAO,
      setupData,
    });

    scripts.push(script);

    return Promise.resolve(script);
  },
};
