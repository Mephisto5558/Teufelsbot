function main({ string, type, options }, convertFunction, skip) {
  if (!string) throw new SyntaxError(
    `The provided input is invalid. It has to look like this:` +
    `input: { string: <STRING>, type: <STRING>, options: { convertTo: <STRING>, withSpaces: [BOOLEAN], convertSpaces: [BOOLEAN], convertOnlyLettersDigits: [BOOLEAN](for text only) }`
  );

  let output = '';

  for (let i = 0; i < string.length; i++) {
    if (type == 'text' && options.convertOnlyLettersDigits && /^[\x2F\x3A-\x40\x5B-\x60\x7B-\x9B\xA1-\xBE]+$/.test(string[i]))  //the regex matches all special chars like "[]" but not something like "äüö"
      output += string[i];
    else if (string[i] == ' ' && !options.convertSpaces) {
      if (options.withSpaces) output += '\n';
      else output += string[i];
    }
    else output += convertFunction(string, i);

    if (options.withSpaces && string[i] != ' ') output += ' ';
    if (skip) i += skip;
  }
  return output;
}

module.exports = {
  getInputType: input => {
    if (!input) return;
    if (/^(?:[01]{8})+$/.test(input)) return 'binary';
    if (/^(?:\d{3}|\s)+$/.test(input)) return 'decimal';
    if (/^(?:[\da-f]{2})+$/i.test(input)) return 'hex';
    //need to find a check for octal string
    return 'text';
  },

  binary: {
    toDecimal: input => main(input, (input, i) => input.substring(i, i + 8).toString(10).padStart(3, '0'), 7),
    toHex: input => main(input, (input, i) => parseInt(input.substring(i, i + 8), 2).toString(16), 7),
    toOctal: input => main(input, (input, i) => parseInt(input.substring(i, i + 8), 2).toString(8), 7),
    toText: input => main(input, (input, i) => String.fromCharCode(parseInt(input.substring(i, i + 8), 2)), 7)
  },

  decimal: {
    toBinary: input => main(input, (input, i) => parseInt(input.substring(i, i + 3), 10).toString(2).padStart(8, '0'), 2),
    toHex: input => main(input, (input, i) => input.substring(i, i + 3).toString(16), 2),
    toOctal: input => main(input, (input, i) => input.substring(i, i + 3).toString(8), 2),
    toText: input => main(input, (input, i) => String.fromCharCode(input.substring(i, i + 3)), 2)
  },

  hex: {
    toBinary: input => main(input, (input, i) => (parseInt(input.substring(i, i + 2), 16).toString(2)).padStart(8, '0'), 1),
    toDecimal: input => main(input, (input, i) => parseInt(input.substring(i, i + 2), 16).padStart(3, '0'), 1),
    toOctal: input => main(input, (input, i) => parseInt(input.substring(i, i + 2 ), 16).toString(8), 1),
    toText: input => main(input, (input, i) => String.fromCharCode(parseInt(input.substring(i, i + 2), 16)), 1)
  },

  octal: {
    toBinary: input => main(input, (input, i) => (parseInt(input.substring(i, i + 3), 8).toString(2)).padStart(8, '0'), 2),
    toDecimal: input => main(input, (input, i) => parseInt(input.substring(i, i + 3), 8).padStart(3, '0'), 2),
    toHex: input => main(input, (input, i) => input.substring(i, i + 3).toString(16), 2),
    toText: input => main(input, (input, i) => String.fromCharCode(parseInt(input.substring(i, i + 3), 8)), 2)
  },

  text: {
    toBinary: input => main(input, convertFunction = (input, i) => (input[i].charCodeAt(0)).toString(2).padStart(8, '0')),
    toDecimal: input => main(input, (input, i) => input.charCodeAt(i).toString(10).padStart(3, '0')),
    toHex: input => main(input, (input, i) => input.charCodeAt(i).toString(16)),
    toOctal: input => main(input, (input, i) => input.charCodeAt(i).toString(8))
  }
}
