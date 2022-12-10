class Converter {
  constructor(input, { type, withSpaces, convertSpaces, convertOnlyLettersDigits } = {}) {
    this.input = input;
    this.type = type ?? Converter.getInputType(this.input);
    this.options = { withSpaces: withSpaces ?? false, convertSpaces: convertSpaces ?? true, convertOnlyLettersDigits: convertOnlyLettersDigits ?? false };

    if (!this.type) throw new Error('input is an required argument' + (typeof this.input != 'string' ? ` and must be typeof string! Received ${typeof this.input}` : '!'));
    if (!Converter.validConvertToOptions.includes(this.type)) throw new RangeError(`${this.type} is not a valid type! valid types are: ${Converter.validConvertToOptions.join(', ')}.`);

    for (const [name, [convertFunction, skip = 0]] of Object.entries(Converter[this.type])) this[name] = (function () {
      let output = '';

      for (let i = 0; i < this.input.length; i += skip + 1) {
        if (this.type == 'text' && this.options.convertOnlyLettersDigits && /^[\x2F\x3A-\x40\x5B-\x60\x7B-\x9B\xA1-\xBE]+$/.test(this.input[i]))  //the regex matches all special chars like "[]" but not something like "äüö"
          output += this.input[i];
        else if (this.input[i] == ' ' && !this.options.convertSpaces)
          output += this.options.withSpaces ? '\n' : ' ';
        else output += convertFunction(this.input, i);

        if (this.options.withSpaces && this.input[i] != ' ') output += ' ';
      }

      return output;
    }).bind(this);
  }

  static getInputType(input) {
    if (!input || typeof input != 'string') return;

    const patterns = {
      binary: /^([01]{8}\s?)+$/,
      decimal: /^(\d{3}\s?)+$/,
      hex: /^(0x)?[0-9a-f\s]+$/i,
      morse: /^([.-]\s?)+$/
    };

    for (const [type, pattern] of Object.entries(patterns)) if (pattern.test(input)) return type;
    return 'text';
  }

  static validConvertToOptions = ['binary', 'decimal', 'hex', 'morse', 'octal', 'text'];

  static binary = {
    toBinary: [input => input, 1e7],
    toDecimal: [(input, i) => input.slice(i, i + 8).toString(10).padStart(3, '0'), 8],
    toHex: [(input, i) => parseInt(input.slice(i, i + 8), 2).toString(16), 8],
    toMorse: [(input, i) => {
      const binaryString = input.slice(i, i + 8);
      return binaryString == '00000000' ? ' ' : binaryString.replace(/0/g, '.').replace(/1/g, '-');
    }, 8],
    toOctal: [(input, i) => parseInt(input.slice(i, i + 8), 2).toString(8), 8],
    toText: [(input, i) => String.fromCharCode(parseInt(input.slice(i, i + 8), 2)), 8]
  };
  static decimal = {
    toBinary: [(input, i) => parseInt(input.slice(i, i + 3), 10).toString(2).padStart(8, '0'), 3],
    toDecimal: [input => input, 1e7],
    toHex: [(input, i) => input.slice(i, i + 3).toString(16), 3],
    toMorse: [(input, i) => {
      const decimalString = input.slice(i, i + 3);
      return decimalString === '000' ? ' ' : Converter.morseBinaryMap[decimalString[0]] + ' ' + Converter.morseBinaryMap[decimalString[1]] + ' ' + Converter.morseBinaryMap[decimalString[2]];
    }, 3],
    toOctal: [(input, i) => input.slice(i, i + 3).toString(8), 3],
    toText: [(input, i) => String.fromCharCode(input.slice(i, i + 3)), 3]
  };
  static hex = {
    toBinary: [(input, i) => parseInt(input.slice(i, i + 2), 16).toString(2).padStart(8, '0'), 2],
    toDecimal: [(input, i) => parseInt(input.slice(i, i + 2), 16).toString().padStart(3, '0'), 2],
    toHex: [input => input, 1e7],
    toMorse: [(input, i) => parseInt(input.slice(i, i + 2), 16).toString(2).replaceAll(0, '.').replaceAll(1, '-'), 2],
    toOctal: [(input, i) => parseInt(input.slice(i, i + 2), 16).toString(8), 2],
    toText: [(input, i) => String.fromCharCode(parseInt(input.slice(i, i + 2), 16)), 2]
  };
  static morse = {
    toBinary: [(input, i) => ({ '.': '10', '-': '11', ' ': '00' }[input.slice(i, i + 1)] || '')],
    toDecimal: [(input, i) => ({ '.': '2', '-': '3', ' ': '0' }[input.slice(i, i + 1)] || '')],
    toHex: [(input, i) => ({ '.': '10', '-': '11', ' ': '00' }[input.slice(i, i + 1)] || '')],
    toMorse: [input => input, 1e7],
    toOctal: [(input, i) => ({ '.': '2', '-': '3', ' ': '0' }[input.slice(i, i + 1)] || '')],
    toText: [(input, i) => (Converter.morseTextMap[input.slice(i, i + 1)] || '')],
  };
  static octal = {
    toBinary: [(input, i) => parseInt(input.slice(i, i + 3), 8).toString(2).padStart(8, '0'), 3],
    toDecimal: [(input, i) => parseInt(input.slice(i, i + 3), 8).toString().padStart(3, '0'), 3],
    toHex: [(input, i) => input.slice(i, i + 3).toString(16), 3],
    toMorse: [(input, i) => parseInt(input.slice(i), 8).toString(2).replaceAll(0, '.').replaceAll(1, '-'), 3],
    toOctal: [input => input, 1e7],
    toText: [(input, i) => String.fromCharCode(parseInt(input.slice(i, i + 3), 8)), 3]
  };
  static text = {
    toBinary: [(input, i) => input[i].charCodeAt(0).toString(2).padStart(8, '0')],
    toDecimal: [(input, i) => input.charCodeAt(i).toString(10).padStart(3, '0')],
    toHex: [(input, i) => input.charCodeAt(i).toString(16)],
    toMorse: [(input, i) => input.slice(i).split('').map(char => Converter.morseTextMap[char.toLowerCase()] || '').join(' ')],
    toOctal: [(input, i) => input.charCodeAt(i).toString(8)],
    toText: [input => input, 1e7]
  };

  static morseTextMap = {
    'a': '.-',
    'b': '-...',
    'c': '-.-.',
    'd': '-..',
    'e': '.',
    'f': '..-.',
    'g': '--.',
    'h': '....',
    'i': '..',
    'j': '.---',
    'k': '-.-',
    'l': '.-..',
    'm': '--',
    'n': '-.',
    'o': '---',
    'p': '.--.',
    'q': '--.-',
    'r': '.-.',
    's': '...',
    't': '-',
    'u': '..-',
    'v': '...-',
    'w': '.--',
    'x': '-..-',
    'y': '-.--',
    'z': '--..',
    '1': '.----',
    '2': '..---',
    '3': '...--',
    '4': '....-',
    '5': '.....',
    '6': '-....',
    '7': '--...',
    '8': '---..',
    '9': '----.',
    '0': '-----',
    '.-': 'a',
    '-...': 'b',
    '-.-.': 'c',
    '-..': 'd',
    '.': 'e',
    '..-.': 'f',
    '--.': 'g',
    '....': 'h',
    '..': 'i',
    '.---': 'j',
    '-.-': 'k',
    '.-..': 'l',
    '--': 'm',
    '-.': 'n',
    '---': 'o',
    '.--.': 'p',
    '--.-': 'q',
    '.-.': 'r',
    '...': 's',
    '-': 't',
    '..-': 'u',
    '...-': 'v',
    '.--': 'w',
    '-..-': 'x',
    '-.--': 'y',
    '--..': 'z',
    '-----': '0',
    '.----': '1',
    '..---': '2',
    '...--': '3',
    '....-': '4',
    '.....': '5',
    '-....': '6',
    '--...': '7',
    '---..': '8',
    '----.': '9'
  };
  static morseBinaryMap = {
    '0': '-----',
    '1': '.----',
    '2': '..---',
    '3': '...--',
    '4': '....-',
    '5': '.....',
    '6': '-....',
    '7': '--...',
    '8': '---..',
    '9': '----.',
    '-----': '0',
    '.----': '1',
    '..---': '2',
    '...--': '3',
    '....-': '4',
    '.....': '5',
    '-....': '6',
    '--...': '7',
    '---..': '8',
    '----.': '9'
  };
}

module.exports = Converter;