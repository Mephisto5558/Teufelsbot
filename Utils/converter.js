class Converter {
  constructor(input, { type = Converter.getInputType(input), withSpaces = false, convertSpaces = true, convertOnlyLettersDigits = false } = {}) {
    if (!type) throw new Error('input is an required argument' + (typeof input != 'string' ? ` and must be typeof string! Received ${typeof input}` : '!'));
    if (!['binary', 'decimal', 'hex', 'octal', 'text'].includes(type)) throw new RangeError(`${type} is not a valid type! valid types are: 'binary', 'decimal', 'hex', 'octal', 'text'.`);

    this.type = type;
    this.input = input;
    this.options = { withSpaces, convertSpaces, convertOnlyLettersDigits };

    for (const [name, [convertFunction, skip]] of Object.entries(Converter[this.type])) {
      this[name] = function () {
        let output = '';

        for (let i = 0; i < this.input.length; i += skip) {
          if (this.type == 'text' && this.options.convertOnlyLettersDigits && /^[\x2F\x3A-\x40\x5B-\x60\x7B-\x9B\xA1-\xBE]+$/.test(this.input[i]))  //the regex matches all special chars like "[]" but not something like "äüö"
            output += this.input[i];
          else if (this.input[i] == ' ' && !this.options.convertSpaces)
            output += this.options.withSpaces ? '\n' : this.input[i];
          else output += convertFunction(this.input, i);

          if (this.options.withSpaces && this.input[i] != ' ') output += ' ';
        }

        return output;
      };
    }
  }

  static getInputType(input) {
    if (!input || typeof input != 'string') return;
    if (/^(?:[01]{8})+$/.test(input)) return 'binary';
    if (/^(?:\d{3}|\s)+$/.test(input)) return 'decimal';
    if (/^(?:[\da-f]{2})+$/i.test(input)) return 'hex';
    //need to find a check for octal string
    return 'text';
  }

  static binary = {
    toDecimal: [(input, i) => input.substring(i, i + 8).toString(10).padStart(3, '0'), 8],
    toHex: [(input, i) => parseInt(input.substring(i, i + 8), 2).toString(16), 8],
    toOctal: [(input, i) => parseInt(input.substring(i, i + 8), 2).toString(8), 8],
    toText: [(input, i) => String.fromCharCode(parseInt(input.substring(i, i + 8), 2)), 8]
  };
  static decimal = {
    toBinary: [(input, i) => parseInt(input.substring(i, i + 3), 10).toString(2).padStart(8, '0'), 3],
    toHex: [(input, i) => input.substring(i, i + 3).toString(16), 3],
    toOctal: [(input, i) => input.substring(i, i + 3).toString(8), 3],
    toText: [(input, i) => String.fromCharCode(input.substring(i, i + 3)), 3]
  };
  static hex = {
    toBinary: [(input, i) => parseInt(input.substring(i, i + 2), 16).toString(2).padStart(8, '0'), 2],
    toDecimal: [(input, i) => parseInt(input.substring(i, i + 2), 16).padStart(3, '0'), 2],
    toOctal: [(input, i) => parseInt(input.substring(i, i + 2), 16).toString(8), 2],
    toText: [(input, i) => String.fromCharCode(parseInt(input.substring(i, i + 2), 16)), 2]
  };
  static octal = {
    toBinary: [(input, i) => parseInt(input.substring(i, i + 3), 8).toString(2).padStart(8, '0'), 3],
    toDecimal: [(input, i) => parseInt(input.substring(i, i + 3), 8).padStart(3, '0'), 3],
    toHex: [(input, i) => input.substring(i, i + 3).toString(16), 3],
    toText: [(input, i) => String.fromCharCode(parseInt(input.substring(i, i + 3), 8)), 3]
  };
  static text = {
    toBinary: [(input, i) => input[i].charCodeAt(0).toString(2).padStart(8, '0')],
    toDecimal: [(input, i) => input.charCodeAt(i).toString(10).padStart(3, '0')],
    toHex: [(input, i) => input.charCodeAt(i).toString(16)],
    toOctal: [(input, i) => input.charCodeAt(i).toString(8)]
  };
}

module.exports = Converter;