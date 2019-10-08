import { Script as ScriptModel } from "../../db/models/script";

import { Script } from "./index";
import { getInitialState } from "./initial-state";
import { History, SetupData } from "./types";

export class ScriptDAO {
  constructor(private modelInstance: ScriptModel) {}

  public async saveActionToDb() {
    await this.modelInstance.update({ actions: this.modelInstance.actions });
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
  }): Promise<any> {
    randomSeedString = randomSeedString || String(Date.now());

    history = history || {
      actions: [],
      initialState: getInitialState(),
    };

    const scriptModel = await ScriptModel.create({
      randomSeedString,
      scriptType: "ESTIMATION",
      initialState: history.initialState,
      actions: history.actions,
    });

    const scriptDAO = new ScriptDAO(scriptModel);

    const script = new Script({
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

    const { randomSeedString, initialState, actions } = scriptModel;

    const history: any = {
      initialState,
      actions,
    };

    const scriptDAO = new ScriptDAO(scriptModel);

    const defaultSetupData: SetupData = {
      depthLimit: 3,
      initialQuestions: [],
      reviewers: [],
    };

    const script = new Script({
      id: scriptModel.id,
      setupData: defaultSetupData,
      history,
      randomSeedString,
      scriptDAO,
    });

    scripts.push(script);

    return Promise.resolve(script);
  },
};
