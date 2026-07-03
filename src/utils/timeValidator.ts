const validUnits = ['y', 'mth', 'w', 'd', 'h', 'min', 's', 'ms'];

/** @example '3w2d', '5h' */
export default function timeValidator<T extends string | undefined>(
  timeStr?: T
): T extends undefined | '' | '-' | '+' ? [] : string[] {
  if (typeof timeStr != 'string' || !timeStr || timeStr == '-' || timeStr == '+')
    return [];

  let
    numberBuffer = '',
    unitBuffer = '',
    previousChar = '';

  for (const char of timeStr) {
    if (char == '-' || char == '+') numberBuffer += char;
    else if (Number.isNaN(Number.parseInt(char, 10)))
      unitBuffer = unitBuffer.length && Number.isNaN(Number.parseInt(previousChar, 10)) ? unitBuffer + char : char;
    else if (!unitBuffer.length || !Number.isNaN(Number.parseInt(previousChar, 10))) numberBuffer += char;
    else if (validUnits.includes(unitBuffer)) {
      numberBuffer += unitBuffer + char;
      unitBuffer = '';
    }

    previousChar = char;
  }

  if (unitBuffer.length <= 0) return validUnits.map(unit => numberBuffer + unit);
  if (validUnits.includes(unitBuffer)) return [numberBuffer + unitBuffer];

  return validUnits.reduce((acc, unit) => {
    if (unit != unitBuffer && unit.startsWith(unitBuffer)) acc.push(numberBuffer + unit);
    return acc;
  }, []);
}