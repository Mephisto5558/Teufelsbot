const validItems = ['y', 'mth', 'w', 'd', 'h', 'min', 's', 'ms'];

/**
 * @param {string}timeStr a time string, e.g. 3w2d
 * @returns {string[]}array of valid values*/
function timeValidator(timeStr) {
  if (!timeStr) return [];

  let
    numberBuffer = '',
    unitBuffer = '';
  for (let i = 0; i < timeStr.length; i++) {
    const char = timeStr[i];

    if (isNaN(char)) unitBuffer = unitBuffer.length && isNaN(timeStr[i - 1]) ? unitBuffer + char : char;
    else if (!unitBuffer.length || !isNaN(timeStr[i - 1])) numberBuffer += char;
    else if (validItems.includes(unitBuffer)) {
      numberBuffer += unitBuffer + char;
      unitBuffer = '';
    }
    else return [];
  }

  if (unitBuffer.length <= 0) return validItems.map(unit => numberBuffer + unit);
  if (validItems.includes(unitBuffer)) return [numberBuffer + unitBuffer];

  return validItems.reduce((acc, unit) => {
    if (unit != unitBuffer && unit.startsWith(unitBuffer)) acc.push(numberBuffer + unit);
    return acc;
  }, []);
}

module.exports = timeValidator;


/** Tests the timeValidator*/
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
    const result = timeValidator(input).join(', ');
    if (result != expectedOutput.join(', ')) console.log(`Input: "${input}" | Expected output: [${expectedOutput.join(', ')}] | Actual output: [${result}]`);
  }
}