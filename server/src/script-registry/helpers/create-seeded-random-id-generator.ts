const uuidv5 = require("uuid/v5");
const seedrandom = require("seedrandom");

export const createSeededRandomIdGenerator = (
  seedString: string,
): (() => string) => {
  const prng = seedrandom(seedString);
  return () => {
    const randomNum = prng();
    const randomId: any = uuidv5(
      String(randomNum),
      "1b671a64-40d5-491e-99b0-da01ff1f3341", // namespace
    );
    return randomId;
  };
};
