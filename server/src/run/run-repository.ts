import { Run } from "./index";

const runs: Run[] = [];

export const RunRepository = {
  addRunToInMemoryCollection(run: Run) {
    runs.push(run);
  },

  findRunByPk(pk: string) {
    if (runs.find(r => r.id === pk)) {
      return runs.find(r => r.id === pk);
    }

    throw Error("Run not found");
  },

  findAll() {
    return runs;
  },

  reset() {
    runs.splice(0); // mutably remove all entries
  },
};
