/**
 * @param {GenericFunction} targetFunction
 * @param {{ input: string[], expectedOutput: any[] }[]} testCases */
module.exports = function testFunction(targetFunction, testCases) {
  for (const { input, expectedOutput } of testCases) {
    const result = targetFunction(...input);
    if (result != expectedOutput) {
      console.log(
        /* eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- okay due to being just a manual testing file */
        `Input: "${typeof input == 'object' ? JSON.stringify(input) : input}" | Expected output: [${expectedOutput}] | Actual output: [${result}]`
      );
    }
  }
};