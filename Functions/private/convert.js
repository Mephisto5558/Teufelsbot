const
  InvalidInputError = {
    name: 'InvalidInputError',
    message: `The provided input is invalid. It has to look like this:` +
      `input: { text: <STRING>, withSpaces: [BOOLEAN], convertSpaces: [BOOLEAN] }`
  },
  regex = [
    /^([01]{8}\s)+$/, //binary
    /^([^a-zA-Z][\x00-\xFF])+$/, //decimal
    /^([0-9A-Fa-f]{6})+$/ //hex
  ];

function splitBinary(input) {
  if(!regex[0].test(input)) return input.split(/([01]{8})\s/);
  else if(!Array.isArray(input)) return input.split(' ');
  else return input;
}

function main(input, convertFunction) {
  if(!input.text) throw InvalidInputError
  let output = '';

  switch(input.convertTo.toLowerCase()) {
    case 'binary': input.text = splitBinary(input.text); break;
    case 'decimal': input.withSpaces = true; break;
  }

  for (i=0; i < input.text.length; i++) {
    if(input.text[i] == ' ') {
      if(input.convertSpaces) output += convertFunction(input, i)
      else if(input.withSpaces) output += '\n';
      else output += ' '
    }
    else output += convertFunction(input, i)
    if(input.withSpaces) output += ' ';
  }
  return output;
};

module.exports = {

  getInputType: function getInputType(input) {
    if(!input) throw {
      name: 'InvalidInputError',
      message: 'You need to provide something as input!'
    };
    
    input = input.replace(' ', '');
    input = splitBinary(input);
    
    if(regex[0].test(input)) type = 'binary';
    else if(regex[1].test(input)) type = 'decimal';
    else if(regex[2].test(input)) type = 'hex';
    else type = 'text';
    return type
  },

  binary: {
    toDecimal: function binaryToDecimal(input) {
      return 'this conversion has not been implemented yet.';
      function convertFunction(input, i) {
        return input[i].text;
      }
      return main(input, convertFunction);
    },
    toHex: function binaryToHex(input) {
      return 'this conversion has not been implemented yet.';
      function convertFunction(input, i) {
        return input[i].text;
      }
      return main(input, convertFunction);
    },
    toText: function binaryToText(input) {
      function convertFunction(input, i) {
         return String.fromCharCode(parseInt(input.text[i], 2));
      }
      return main(input, convertFunction);
    }
  },
  
  decimal: {
    toBinary: function decimalToBinary(input) {
      return 'this conversion has not been implemented yet.';
      function convertFunction(input, i) {
        return input[i].text;
      }
      return main(input, convertFunction);
    },
    toHex: function decimalToHex(input) {
      return 'this conversion has not been implemented yet.';
      function convertFunction(input, i) {
        return input[i].text;
      }
      return main(input, convertFunction);
    },
    toText: function decimalToText(input) {
      function convertFunction(input, i) {
        return String.fromCharCode(input.text[i]);
      }
      return main(input, convertFunction).join();
    }
  },

  hex: {
    toBinary: function hexToBinary(input) {
      return 'this conversion has not been implemented yet.';
      function convertFunction(input, i) {
        return input[i].text;
      }
      return main(input, convertFunction);
    },
    toDecimal: function hexToDecimal(input) {
      return 'this conversion has not been implemented yet.';
      function convertFunction(input, i) {
        return input[i].text;
      }
      return main(input, convertFunction);
    },
    toText: function hexToText(input) {
      return 'this conversion has not been implemented yet.';
      function convertFunction(input, i) {
        return input[i].text;
      }
      return main(input, convertFunction);
    }
  },

  text: { 
    toBinary: function textToBinary(input) {
      if(!input.text) throw InvalidInputError
      function convertFunction(input, i) {
        return (0b100000000 + input.text[i].charCodeAt(0)).toString(2).substring(1);
      }
      return main(input, convertFunction);
    },
    toDecimal: function textToDecimal(input) {
      function convertFunction(input, i) {
        return input.text[i].charCodeAt(0).toString(10);
      }
      return main(input, convertFunction);
    },
    toHex: function textToHex(input) {
      function convertFunction(input, i) {
        return input.text[i].charCodeAt(0).toString(16);
      }
      return main(input, convertFunction);
    }
  }

}