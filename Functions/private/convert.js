const
  InvalidInputError = {
    code: 'InvalidInputError',
    message: `The provided input is invalid. It has to look like this:` +
      `input: { string: <STRING>, type: <STRING>, options: { convertTo: <STRING>, withSpaces: [BOOLEAN], convertSpaces: [BOOLEAN], convertOnlyLettersDigits: [BOOLEAN](text only) }`
  },
  regex = [
    /^(?:[01]{8})+$/, //binary
    /^(?:[0-9]{3}|\s)+$/, //decimal
    /^(?:[0-9a-f]{2})+$/i, //hex
    /^[\x00-\x2F\x3A-\x40\x5B-\x60\x7B-\x9B\xA1-\xBE]+$/, //matches all special chars like "[]" but not something like "äüö"
  ];

function main(input, convertFunction, skip) {
  if(!input.string) throw InvalidInputError;
  
  let output = '';
  let options = input.options

  for(i = 0; i < input.string.length; i++) {
    if(
      input.type == 'text' &&
      options.convertOnlyLettersDigits &&
      regex[3].test(input.string[i])
    ) output += input.string[i];
    else if(input.string[i] == ' ') {
      if(options.convertSpaces) output += convertFunction(input.string, i)
      else if(options.withSpaces) output += '\n';
      else output += ' '
    }
    else output += convertFunction(input.string, i);

    if(options.withSpaces && input.string[i] != ' ') output += ' ';
    if(skip) i += skip;
  }
  return output;
}

module.exports = {

  getInputType: function getInputType(input) {
    if(!input) throw {
      code: 'InvalidInputError',
      message: 'You need to provide something as input!'
    };

    if(regex[0].test(input)) type = 'binary';
    else if(regex[1].test(input)) type = 'decimal';
    else if(regex[2].test(input)) type = 'hex';
    else type = 'text';
    return type
  },

  binary: { //Fully working
    toDecimal: function binaryToDecimal(input) {
      function convertFunction(input, i) {
        return input.substring(i, i + 8).toString(10).padStart(3, '0');
      }
      return main(input, convertFunction, 7);
    },
    toHex: function binaryToHex(input) {
      function convertFunction(input, i) {
        return parseInt(input.substring(i, i + 8), 2).toString(16)
      }
      return main(input, convertFunction, 7);
    },
    toText: function binaryToText(input) {
      function convertFunction(input, i) {
        return String.fromCharCode(parseInt(input.substring(i, i + 8), 2));
      }
      return main(input, convertFunction, 7);
    }
  },

  decimal: { //Fully working
    toBinary: function decimalToBinary(input) {
      function convertFunction(input, i) {
        return parseInt(input.substring(i, i + 3), 10).toString(2).padStart(8, '0');
      }
      return main(input, convertFunction, 2);
    },
    toHex: function decimalToHex(input) {
      function convertFunction(input, i) {
        return input.substring(i, i + 3).toString(16);
      }
      return main(input, convertFunction);
    },
    toText: function decimalToText(input) {
      function convertFunction(input, i) {
        return String.fromCharCode(input.substring(i, i + 3));
      }
      return main(input, convertFunction, 2);
    }
  },

  hex: { //Fully working
    toBinary: function hexToBinary(input) {
      function convertFunction(input, i) {
        return(parseInt(input.substring(i, i + 2), 16).toString(2)).padStart(8, '0');
      }
      return main(input, convertFunction, 1);
    },
    toDecimal: function hexToDecimal(input) {
      function convertFunction(input, i) {
        return parseInt(input.substring(i, i + 2), 16).padStart(3, '0');
      }
      return main(input, convertFunction, 1);
    },
    toText: function hexToText(input) {
      function convertFunction(input, i) {
        return String.fromCharCode(parseInt(input.substring(i, i + 2), 16));
      }
      return main(input, convertFunction, 1);
    }
  },

  text: { //Fully working
    toBinary: function textToBinary(input) {
      function convertFunction(input, i) {
        return(input[i].charCodeAt(0)).toString(2).padStart(8, '0');
      }
      return main(input, convertFunction);
    },
    toDecimal: function textToDecimal(input) {
      function convertFunction(input, i) {
        return input[i].charCodeAt(0).toString(10).padStart(3, '0');
      }
      return main(input, convertFunction);
    },
    toHex: function textToHex(input) {
      function convertFunction(input, i) {
        return input[i].charCodeAt(0).toString(16);
      }
      return main(input, convertFunction);
    }
  }

}