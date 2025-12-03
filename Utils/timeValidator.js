/** @import { timeValidator } from '.' */

const validItems = ['y', 'mth', 'w', 'd', 'h', 'min', 's', 'ms'];

/** @type {timeValidator} */
module.exports = function timeValidator(timeStr) {
  if (typeof timeStr != 'string' || !timeStr || timeStr == '-' || timeStr == '+')
    return [];

  let
    numberBuffer = '',
    unitBuffer = '',
    previousChar = '';

  for (const char of timeStr) {
    if (char == '-' || char == '+') numberBuffer += char;
    else if (Number.isNaN(Number.parseInt(char)))
      unitBuffer = unitBuffer.length && Number.isNaN(Number.parseInt(previousChar)) ? unitBuffer + char : char;
    else if (!unitBuffer.length || !Number.isNaN(Number.parseInt(previousChar))) numberBuffer += char;
    else if (validItems.includes(unitBuffer)) {
      numberBuffer += unitBuffer + char;
      unitBuffer = '';
    }

    previousChar = char;
  }

  if (unitBuffer.length <= 0) return validItems.map(unit => numberBuffer + unit);
  if (validItems.includes(unitBuffer)) return [numberBuffer + unitBuffer];

  return validItems.reduce((acc, unit) => {
    if (unit != unitBuffer && unit.startsWith(unitBuffer)) acc.push(numberBuffer + unit);
    return acc;
  }, []);
};