export const convertUUIDToCoinflip = (uuid: string): boolean => {
  // reducer has a seeded random id generator
  // will use this source of randomness to determine order
  // in which answer candidates are displayed to judge
  return /[0-7]/.test(uuid[0]);
};
