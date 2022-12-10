const Converter = require('C:/Users/Mephisto/Documents/Teufelsbot/Teufelsbot/Utils/converter.js');

function testGetInputType() {
  const testCases = [
    { input: '01010101', expected: 'binary' },
    { input: '012', expected: 'decimal' },
    { input: '0x12', expected: 'hex' },
    { input: '... --- ...', expected: 'morse' },
    { input: 'Hello World', expected: 'text' }
  ];

  for (const testCase of testCases) {
    const result = Converter.getInputType(testCase.input);
    if (result !== testCase.expected)
      console.log(`❌ Unexpected output for input ${testCase.input}: expected ${testCase.expected}, got ${result}`);
  }
}

function testWithSpaces() {
  // Testen des withSpaces-Parameters für Binary
  const binaryConverter = new Converter('01010101', { type: 'binary', withSpaces: true });
  if (binaryConverter.toBinary() !== '01010101') console.error('❌ Unexpected output for binary with withSpaces!');
  if (binaryConverter.toDecimal() !== '85') console.error('❌ Unexpected output for binary with withSpaces!');
  if (binaryConverter.toHex() !== '55') console.error('❌ Unexpected output for binary with withSpaces!');
  if (binaryConverter.toMorse() !== '- .... . ... .... .') console.error('❌ Unexpected output for binary with withSpaces!');
  if (binaryConverter.toOctal() !== '125') console.error('❌ Unexpected output for binary with withSpaces!');

  // Testen des withSpaces-Parameters für Decimal
  const decimalConverter = new Converter('123', { type: 'decimal', withSpaces: true });
  if (decimalConverter.toBinary() !== '000100100011') console.error('❌ Unexpected output for decimal with withSpaces!');
  if (decimalConverter.toDecimal() !== '123') console.error('❌ Unexpected output for decimal with withSpaces!');
  if (decimalConverter.toHex() !== '7b') console.error('❌ Unexpected output for decimal with withSpaces!');
  if (binaryConverter.toMorse() !== '··· - ···') console.error('❌ Unexpected output for binary with withSpaces!');
  if (binaryConverter.toOctal() !== '173') console.error('❌ Unexpected output for binary with withSpaces!');

  // Testen des withSpaces-Parameters für Hex
  const hexConverter = new Converter('0x12', { type: 'hex', withSpaces: true });
  if (hexConverter.toBinary() !== '00010010') console.error('❌ Unexpected output for hex with withSpaces!');
  if (hexConverter.toDecimal() !== '18') console.error('❌ Unexpected output for hex with withSpaces!');
  if (hexConverter.toHex() !== '12') console.error('❌ Unexpected output for hex with withSpaces!');
  if (hexConverter.toMorse() !== '· -') console.error('❌ Unexpected output for hex with withSpaces!');
  if (hexConverter.toOctal() !== '22') console.error('❌ Unexpected output for hex with withSpaces!');

  // Testen des withSpaces-Parameters für Morse
  const morseConverter = new Converter('- .... . ... .... .', { type: 'morse', withSpaces: true });
  if (morseConverter.toBinary() !== '01010101') console.error('❌ Unexpected output for morse with withSpaces!');
  if (morseConverter.toDecimal() !== '85') console.error('❌ Unexpected output for morse with withSpaces!');
  if (morseConverter.toHex() !== '55') console.error('❌ Unexpected output for morse with withSpaces!');
  if (morseConverter.toMorse() !== '- .... . ... .... .') console.error('❌ Unexpected output for morse with withSpaces!');
  if (morseConverter.toOctal() !== '125') console.error('❌ Unexpected output for morse with withSpaces!');

  // Testen des withSpaces-Parameters für Octal
  const octalConverter = new Converter('123', { type: 'octal', withSpaces: true });
  if (octalConverter.toBinary() !== '000100100011') console.error('❌ Unexpected output for octal with withSpaces!');
  if (octalConverter.toDecimal() !== '83') console.error('❌ Unexpected output for octal with withSpaces!');
  if (octalConverter.toHex() !== '53') console.error('❌ Unexpected output for octal with withSpaces!');
  if (octalConverter.toMorse() !== '··· - ···') console.error('❌ Unexpected output for octal with withSpaces!');
  if (octalConverter.toOctal() !== '123') console.error('❌ Unexpected output for octal with withSpaces!');

  // Testen des withSpaces-Parameters für Text
  const textConverter = new Converter('Hello World', { type: 'text', withSpaces: true });
  if (textConverter.toBinary() !== '01001000 01100101 01101100 01101100 01101111 00100000 01110111 01101111 01110010 01101100 01100100') console.error('❌ Unexpected output for text with withSpaces!');
  if (textConverter.toDecimal() !== '72 101 108 108 111 32 119 111 114 108 100') console.error('❌ Unexpected output for text with withSpaces!');
  if (textConverter.toHex() !== '48 65 6c 6c 6f 20 77 6f 72 6c 64') console.error('❌ Unexpected output for text with withSpaces!');
  if (textConverter.toMorse() !== '.... . .-.. .-.. --- .-- --- .-. .-.. -..') console.error('❌ Unexpected output for text with withSpaces!');
  if (textConverter.toOctal() !== '110 145 154 154 157 40 167 157 162 154 144') console.error('❌ Unexpected output for text with withSpaces!');
}

function testConvertSpaces() {
  // Testen der convertSpaces-Option für Binary
  const binaryConverter = new Converter('01010101', { type: 'binary', convertSpaces: false });
  if (binaryConverter.toBinary() !== '01010101') console.error('❌ Unexpected output for binary with convertSpaces!');
  if (binaryConverter.toDecimal() !== '85') console.error('❌ Unexpected output for binary with convertSpaces!');
  if (binaryConverter.toHex() !== '55') console.error('❌ Unexpected output for binary with convertSpaces!');
  if (binaryConverter.toMorse() !== '- .... . ... .... .') console.error('❌ Unexpected output for binary with convertSpaces!');
  if (binaryConverter.toOctal() !== '125') console.error('❌ Unexpected output for binary with convertSpaces!');

  // Testen der convertSpaces-Option für Decimal
  const decimalConverter = new Converter('123', { type: 'decimal', convertSpaces: false });
  if (decimalConverter.toBinary() !== '000100100011') console.error('❌ Unexpected output for decimal with convertSpaces!');
  if (decimalConverter.toDecimal() !== '123') console.error('❌ Unexpected output for decimal with convertSpaces!');
  if (decimalConverter.toHex() !== '7b') console.error('❌ Unexpected output for decimal with convertSpaces!');
  if (decimalConverter.toMorse() !== '··· - ···') console.error('❌ Unexpected output for decimal with convertSpaces!');
  if (decimalConverter.toOctal() !== '173') console.error('❌ Unexpected output for decimal with convertSpaces!');

  // Testen der convertSpaces-Option für Hex
  const hexConverter = new Converter('0x55', { type: 'hex', convertSpaces: false });
  if (hexConverter.toBinary() !== '01010101') console.error('❌ Unexpected output for hex with convertSpaces!');
  if (hexConverter.toDecimal() !== '85') console.error('❌ Unexpected output for hex with convertSpaces!');
  if (hexConverter.toHex() !== '55') console.error('❌ Unexpected output for hex with convertSpaces!');
  if (hexConverter.toMorse() !== '- .... . ... .... .') console.error('❌ Unexpected output for hex with convertSpaces!');
  if (hexConverter.toOctal() !== '125') console.error('❌ Unexpected output for hex with convertSpaces!');

  // Testen des convertSpaces-Parameters für Morse
  const morseConverter = new Converter('... --- ...', { type: 'morse', convertSpaces: false });
  if (morseConverter.toMorse() !== '... --- ...') console.error('❌ Unexpected output for morse with convertSpaces!');
  if (morseConverter.toBinary() !== '00110101 00111000 00110101') console.error('❌ Unexpected output for morse with convertSpaces!');
  if (morseConverter.toDecimal() !== '53 56 53') console.error('❌ Unexpected output for morse with convertSpaces!');
  if (morseConverter.toHex() !== '35 38 35') console.error('❌ Unexpected output for morse with convertSpaces!');
  if (morseConverter.toOctal() !== '65 70 65') console.error('❌ Unexpected output for morse with convertSpaces!');
  if (morseConverter.toText() !== 'SXS') console.error('❌ Unexpected output for morse with convertSpaces!');

  // Testen des convertSpaces-Parameters für Octal
  const octalConverter = new Converter('01234567', { type: 'octal', convertSpaces: false });
  if (octalConverter.toBinary() !== '000101010001010100010101') console.error('❌ Unexpected output for octal with convertSpaces!');
  if (octalConverter.toDecimal() !== '82 82 82') console.error('❌ Unexpected output for octal with convertSpaces!');
  if (octalConverter.toHex() !== '52 52 52') console.error('❌ Unexpected output for octal with convertSpaces!');
  if (octalConverter.toMorse() !== '... --- ...') console.error('❌ Unexpected output for octal with convertSpaces!');
  if (octalConverter.toOctal() !== '1234567') console.error('❌ Unexpected output for octal with convertSpaces!');
  if (octalConverter.toText() !== 'R R R') console.error('❌ Unexpected output for octal with convertSpaces!');

  // Testen der convertSpaces-Option für Text
  const textConverter = new Converter('Hello World', { type: 'text', convertSpaces: false });
  if (textConverter.toBinary() !== '01001000 01100101 01101100 01101100 01101111 00100000 01010111 01101111 01110010 01101100 01100100') console.error('❌ Unexpected output for text with convertSpaces!');
  if (textConverter.toDecimal() !== '72 101 108 108 111 32 119 111 114 108 100') console.error('❌ Unexpected output for text with convertSpaces!');
  if (textConverter.toHex() !== '48 65 6c 6c 6f 20 77 6f 72 6c 64') console.error('❌ Unexpected output for text with convertSpaces!');
  if (textConverter.toMorse() !== '.... . .-.. .-.. --- .-- --- .-. .-.. -..') console.error('❌ Unexpected output for text with convertSpaces!');
  if (textConverter.toOctal() !== '110 145 154 154 157 40 167 157 162 154 144') console.error('❌ Unexpected output for text with convertSpaces!');
}

function testConvertOnlyLettersDigits() {
  // Testen des convertOnlyLettersDigits-Parameters für Binary
  const binaryConverter = new Converter('01010101', { type: 'binary', convertOnlyLettersDigits: true });
  if (binaryConverter.toBinary() !== '01010101') console.error('❌ Unexpected output for binary with convertOnlyLettersDigits!');
  if (binaryConverter.toDecimal() !== '85') console.error('❌ Unexpected output for binary with convertOnlyLettersDigits!');
  if (binaryConverter.toHex() !== '55') console.error('❌ Unexpected output for binary with convertOnlyLettersDigits!');
  if (binaryConverter.toMorse() !== '- .... . ... .... .') console.error('❌ Unexpected output for binary with convertOnlyLettersDigits!');
  if (binaryConverter.toOctal() !== '125') console.error('❌ Unexpected output for binary with convertOnlyLettersDigits!');

  // Testen des convertOnlyLettersDigits-Parameters für Decimal
  const decimalConverter = new Converter('123', { type: 'decimal', convertOnlyLettersDigits: true });
  if (decimalConverter.toBinary() !== '000100100011') console.error('❌ Unexpected output for decimal with convertOnlyLettersDigits!');
  if (decimalConverter.toDecimal() !== '123') console.error('❌ Unexpected output for decimal with convertOnlyLettersDigits!');
  if (decimalConverter.toHex() !== '7b') console.error('❌ Unexpected output for decimal with convertOnlyLettersDigits!');
  if (decimalConverter.toMorse() !== '··· - ···') console.error('❌ Unexpected output for decimal with convertOnlyLettersDigits!');
  if (decimalConverter.toOctal() !== '173') console.error('❌ Unexpected output for decimal with convertOnlyLettersDigits!');

  // Testen des convertOnlyLettersDigits-Parameters für Hex
  const hexConverter = new Converter('0x12', { type: 'hex', convertOnlyLettersDigits: true });
  if (hexConverter.toBinary() !== '00010010') console.error('❌ Unexpected output for hex with convertOnlyLettersDigits!');
  if (hexConverter.toDecimal() !== '18') console.error('❌ Unexpected output for hex with convertOnlyLettersDigits!');
  if (hexConverter.toHex() !== '12') console.error('❌ Unexpected output for hex with convertOnlyLettersDigits!');
  if (hexConverter.toMorse() !== '- .... ..') console.error('❌ Unexpected output for hex with convertOnlyLettersDigits!');
  if (hexConverter.toOctal() !== '22') console.error('❌ Unexpected output for hex with convertOnlyLettersDigits!');

  // Testen des convertOnlyLettersDigits-Parameters für Octal
  const octalConverter = new Converter('765', { type: 'octal', convertOnlyLettersDigits: true });
  if (octalConverter.toBinary() !== '111 101 110') console.error('❌ Unexpected output for octal with convertOnlyLettersDigits!');
  if (octalConverter.toDecimal() !== '501') console.error('❌ Unexpected output for octal with convertOnlyLettersDigits!');
  if (octalConverter.toHex() !== '1f6') console.error('❌ Unexpected output for octal with convertOnlyLettersDigits!');
  if (octalConverter.toMorse() !== '--- ..- -...') console.error('❌ Unexpected output for octal with convertOnlyLettersDigits!');
  if (octalConverter.toOctal() !== '765') console.error('❌ Unexpected output for octal with convertOnlyLettersDigits!');

  // Testen des convertOnlyLettersDigits-Parameters für Text
  const textConverter = new Converter('Hello World', { type: 'text', convertOnlyLettersDigits: true });
  if (textConverter.toBinary() !== '01001000 01100101 01101100 01101100 01101111 00100000 01010111 01101111 01110010 01101100 01100100') console.error('❌ Unexpected output for text with convertOnlyLettersDigits!');
  if (textConverter.toDecimal() !== '72 101 108 108 111 32 119 111 114 108 100') console.error('❌ Unexpected output for text with convertOnlyLettersDigits!');
  if (textConverter.toHex() !== '48 65 6c 6c 6f 20 77 6f 72 6c 64') console.error('❌ Unexpected output for text with convertOnlyLettersDigits!');
  if (textConverter.toMorse() !== '.... . .-.. .-.. --- .-- --- .-. .-.. -..') console.error('❌ Unexpected output for text with convertOnlyLettersDigits!');
  if (textConverter.toOctal() !== '110 145 154 154 157 040 167 157 162 154 144') console.error('❌ Unexpected output for text with convertOnlyLettersDigits!');
  if (textConverter.toText() !== 'Hello World') console.error('❌ Unexpected output for text with convertOnlyLettersDigits!');
}

testGetInputType();
console.log('Finished type check');
testWithSpaces();
console.log('Finished withSpaces check');
testConvertSpaces();
console.log('Finished convertSpaces check');
testConvertOnlyLettersDigits();
console.log('Finished testConvertOnlyLettersDigits check');