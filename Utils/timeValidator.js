const validItems = ['y', 'mth', 'w', 'd', 'h', 'min', 's', 'ms'];

/**@param {string}t a time string, e.g. 3w2d @returns {string[]}array of valid values*/
module.exports = function timeValidator(t) {
  if (!t) return [];

  const results = [];
  let
    numberBuffer = '',
    unitBuffer = '',
    lastCharWasNumber = true;

  for (const char of t) {
    if (isNaN(char)) {
      if (lastCharWasNumber) unitBuffer = char;
      else unitBuffer += char;

      lastCharWasNumber = false;
      continue;
    }

    if (lastCharWasNumber) numberBuffer += char;
    else {
      if (unitBuffer.length) {
        if (validItems.includes(unitBuffer)) numberBuffer += unitBuffer;
        else return [];
        unitBuffer = '';
      }
      numberBuffer += char;
    }
    lastCharWasNumber = true;
  }

  if (unitBuffer.length <= 0) for (const unit of validItems) results.push(numberBuffer + unit);
  else if (validItems.includes(unitBuffer)) {
    if (!results[results.length - 1]?.endsWith(unitBuffer)) results.push(numberBuffer + unitBuffer);
  }
  else {
    const possibleUnits = validItems.filter(unit => unit !== unitBuffer && unit.startsWith(unitBuffer));
    if (!possibleUnits.length) return [];

    for (const unit of possibleUnits) results.push(numberBuffer + unit);
  }

  return results;
};


// eslint-disable-next-line no-unused-vars
function testTimevalidator() {
  const testCases = [
    { input: '3', expectedOutput: ['3y', '3mth', '3w', '3d', '3h', '3min', '3s', '3ms'] },
    { input: '3w', expectedOutput: ['3w'] },
    { input: '3m', expectedOutput: ['3mth', '3min', '3ms'] },
    { input: '3y2', expectedOutput: ['3y2y', '3y2mth', '3y2w', '3y2d', '3y2h', '3y2min', '3y2s', '3y2ms'] },
    { input: '3w2y', expectedOutput: ['3w2y'] },
    { input: '', expectedOutput: [] },
    { input: 'invalid', expectedOutput: [] },
    { input: '3p', expectedOutput: [] },
    { input: '3p2h', expectedOutput: [] }
  ];

  for (const { input, expectedOutput } of testCases) {
    const result = module.exports.timeValidator(input).join(', ');
    if (result != expectedOutput.join(', ')) console.log(`Input: "${input}" | Expected output: [${expectedOutput.join(', ')}] | Actual output: [${result}]`);
  }
}