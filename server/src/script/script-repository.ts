import { FactoredEvaluationScriptRepository } from "../script-registry/factored-evaluation-script/script-repository";

export const ScriptRepository = {
  create: FactoredEvaluationScriptRepository.create,
  findByPk: FactoredEvaluationScriptRepository.findByPk,
};
