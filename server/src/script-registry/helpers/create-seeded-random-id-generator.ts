const uuidv5 = require("uuid/v5");
const seedrandom = require("seedrandom");

export type CopyablePrngId = {
  (): string;
  createFreshCopy: () => CopyablePrngId;
};

export const createSeededRandomIdGenerator = (
  seedString: string,
): CopyablePrngId => {
  const prng = seedrandom(seedString);

  const prngId = () => {
    const randomNum = prng();
    const randomId: string = uuidv5(
      String(randomNum),
      "1b671a64-40d5-491e-99b0-da01ff1f3341", // namespace
    );
    return randomId;
  };

  prngId.createFreshCopy = () => createSeededRandomIdGenerator(seedString);

  return prngId;
};
