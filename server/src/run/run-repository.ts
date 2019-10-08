import { Run } from "./index";

import { Run as RunModel } from "../db/models/run";
import { IRunLevelScheduler } from "../run-level-scheduler";
import { TrivialRunLevelScheduler } from "../run-level-scheduler-registry/trivial-run-level-scheduler";
import { IScript } from "../script";
import { ScriptRepository } from "../script/script-repository";

const runs: Run[] = [];

export const RunRepository = {
  async create(script: IScript, runLevelScheduler: IRunLevelScheduler) {
    const runModelInstance = await RunModel.create({
      scriptId: script.id,
    });

    const run = new Run(runModelInstance.id, script, runLevelScheduler);

    runs.push(run);

    return run;
  },

  async findRunByPk(pk: string) {
    const cachedRun = runs.find(r => r.id === pk);
    if (cachedRun) {
      return cachedRun;
    }

    const runModelInstance = await RunModel.findByPk(pk);
    if (!runModelInstance) {
      throw Error("Run not found");
    }

    const script = await ScriptRepository.findByPk(runModelInstance.scriptId);
    if (!script) {
      throw Error("Script associated with run not found.");
    }

    const run = new Run(
      runModelInstance.id,
      script,
      new TrivialRunLevelScheduler(script),
    );

    runs.push(run);

    return run;
  },

  findAll() {
    return runs;
  },

  async loadAll() {
    const runModelInstances = await RunModel.findAll();

    const runIds = runModelInstances.map(r => r.id);

    const runsToLoad = await Promise.all(
      runIds.map(async rId => {
        return await RunRepository.findRunByPk(rId);
      }),
    );

    return runsToLoad;
  },

  reset() {
    runs.splice(0); // mutably remove all entries
  },
};
