const
  InvalidInputError = {
    code: 'InvalidInputError',
    message: `The provided input is invalid. It has to look like this:` +
      `input: { string: <STRING>, withSpaces: [BOOLEAN], convertSpaces: [BOOLEAN] }`
  },
  regex = [
    /^(?:[01]{8})+$/, //binary
    /^(?:[0-9a-f]{2})+$/i, //hex
    /^(?:[^a-z][\x00-\xFF][^a-z])+[^a-z]*$|^[^a-z]\s[^a-z]$/i //decimal
  ];

function main(input, convertFunction, skip) {
  if(!input.string) throw InvalidInputError
  let output = '';
  
  switch(input.type.toLowerCase()) {
    case 'decimal': input.string = input.string.split(' '); break;
  }
  
  switch(input.convertTo.toLowerCase()) {
    case 'decimal': input.withSpaces = true; break;
  }
  
  for (i=0; i < input.string.length; i++) {
    if(input.string[i] == ' ') {
      if(input.convertSpaces) output += convertFunction(input.string, i)
      else if(input.withSpaces) output += '\n';
      else output += ' '
    }
    else output += convertFunction(input.string, i)
    if(input.withSpaces) output += ' ';
    if(skip) i += skip;
  }
  return output;
};

module.exports = {

  getInputType: function getInputType(input) {
    if(!input) throw {
      code: 'InvalidInputError',
      message: 'You need to provide something as input!'
    };
    
    if(regex[0].test(input)) type = 'binary';
    else if(regex[1].test(input)) type = 'hex';
    else if(regex[2].test(input)) type = 'decimal';
    else type = 'text';
    return type
  },

  binary: {
    toDecimal: function binaryToDecimal(input) {
      return 'this conversion has not been implemented yet.';
      function convertFunction(input, i) {
        return input[i];
      }
      return main(input, convertFunction);
    },
    toHex: function binaryToHex(input) {
      return 'this conversion has not been implemented yet.';
      function convertFunction(input, i) {
        return input[i];
      }
      return main(input, convertFunction);
    },
    toText: function binaryToText(input) {
      function convertFunction(input, i) {
         return String.fromCharCode(parseInt(input.substring(i, i+8), 2));
      }
      return main(input, convertFunction, 7);
    }
  },
  
  decimal: {
    toBinary: function decimalToBinary(input) {
      return 'this conversion has not been implemented yet.';
      function convertFunction(input, i) {
        return input[i];
      }
      return main(input, convertFunction);
    },
    toHex: function decimalToHex(input) {
      return 'this conversion has not been implemented yet.';
      function convertFunction(input, i) {
        return input[i];
      }
      return main(input, convertFunction);
    },
    toText: function decimalToText(input) {
      function convertFunction(input, i) {
        return String.fromCharCode(input[i]);
      }
      return main(input, convertFunction);
    }
  },

  hex: { //Fully working
    toBinary: function hexToBinary(input) {
      function convertFunction(input, i) {
        return (parseInt(input.substring(i, i+2), 16).toString(2)).padStart(8, '0');
      }
      return main(input, convertFunction, 1);
    },
    toDecimal: function hexToDecimal(input) {
      function convertFunction(input, i) {
        return parseInt(input.substring(i, i+2), 16);
      }
      return main(input, convertFunction, 1);
    },
    toText: function hexToText(input) {
      function convertFunction(input, i) {
        return String.fromCharCode(parseInt(input.substring(i, i+2), 16));
      }
      return main(input, convertFunction, 1);
    }
  },

  text: { //Fully working
    toBinary: function textToBinary(input) {
      function convertFunction(input, i) {
        return (input[i].charCodeAt(0)).toString(2).padStart(8, '0');
      }
      return main(input, convertFunction);
    },
    toDecimal: function textToDecimal(input) {
      function convertFunction(input, i) {
        return input[i].charCodeAt(0).toString(10);
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