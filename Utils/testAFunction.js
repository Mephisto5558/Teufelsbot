/**
 * @param {(...params: any) => any}targetFunction
 * @param {{ input: string[], expectedOutput: any[] }[]}testCases*/
module.exports = function testFunction(targetFunction, testCases) {
  for (const { input, expectedOutput } of testCases) {
    const result = targetFunction(...input);
    if (result != expectedOutput) console.log(`Input: "${input}" | Expected output: [${expectedOutput}] | Actual output: [${result}]`);
  }
};