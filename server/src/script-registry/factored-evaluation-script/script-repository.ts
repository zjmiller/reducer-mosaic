import { Script as ScriptModel } from "../../db/models/script";
import { FactoredEvaluationAction } from "./actions";
import { getInitialState } from "./get-initial-state";
import { createSeededRandomIdGenerator } from "../helpers/create-seeded-random-id-generator";
import {
  Experts,
  FactoredEvaluationScript,
  FactoredEvaluationScriptHistory,
} from "./index";

export class ScriptDAO {
  constructor(private modelInstance: ScriptModel) {}

  public async saveActionToDb(action: FactoredEvaluationAction) {
    const actions = this.modelInstance.actions;

    await this.modelInstance.update({
      actions: actions.concat(action),
    });
  }
}

const scripts: FactoredEvaluationScript[] = [];

export const FactoredEvaluationScriptRepository = {
  async create({
    rootLevelQuestion,
    experts,
    history,
    randomSeedString,
  }: {
    rootLevelQuestion?: string;
    experts?: Experts;
    history?: FactoredEvaluationScriptHistory;
    randomSeedString?: string;
  }): Promise<FactoredEvaluationScript> {
    randomSeedString = randomSeedString || String(Date.now());

    rootLevelQuestion =
      rootLevelQuestion ||
      "This is the default content for a factored evaluation root-level question";

    experts = experts || {
      honest: [],
      malicious: [],
    };

    const prngId = createSeededRandomIdGenerator(randomSeedString);

    history = history || {
      actions: [],
      initialState: getInitialState(),
    };

    const scriptModel = await ScriptModel.create({
      randomSeedString,
      initialState: history.initialState,
      actions: history.actions,
    });

    const scriptDAO = new ScriptDAO(scriptModel);

    const script = new FactoredEvaluationScript({
      id: scriptModel.id,
      rootLevelQuestion,
      experts,
      history,
      randomSeedString,
      prngId,
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

    const rootLevelQuestion = initialState.question;

    const experts: Experts = initialState.experts;

    const prngId = createSeededRandomIdGenerator(randomSeedString);

    const history: FactoredEvaluationScriptHistory = {
      initialState,
      actions,
    };

    const scriptDAO = new ScriptDAO(scriptModel);

    const script = new FactoredEvaluationScript({
      id: scriptModel.id,
      rootLevelQuestion,
      experts,
      history,
      randomSeedString,
      prngId,
      scriptDAO,
    });

    scripts.push(script);

    return Promise.resolve(script);
  },
};