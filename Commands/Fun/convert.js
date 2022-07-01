const
  { Command } = require('reconlx'),
  { MessageAttachment } = require('discord.js'),
  convert = require('../../Functions/private/convert.js');

function replace(input, defaultValue) {
  if(!input && input !== false) return defaultValue;
  return input;
}

module.exports = new Command({
  name: 'convert',
  alias: [],
  description: 'Converts one type of text to another',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: false, beta: true,////////////////////
  options: [
    {
      name: 'input',
      description: 'the text you want to convert',
      type: 'STRING',
      required: true
    },
    {
      name: 'convert_to',
      description: 'The output type',
      type: 'STRING',
      required: true,
      choices: [
        { name: 'binary', value: 'Binary' },
        { name: 'decimal/ASCII', value: 'Decimal' },
        { name: 'hexadecimal', value: 'Hex' },
        { name: 'text', value: 'Text' }
      ],
    },
    {
      name: 'with_spaces',
      description: 'Do you want to have spaces between the letters? Default: false',
      type: 'BOOLEAN',
      required: false
    },
    {
      name: 'convert_spaces',
      description: 'Do you want to also convert spaces? Default: true',
      type: 'BOOLEAN',
      required: false
    },
    {
      name: 'convert_letters_and_digits_only',
      description: 'Do you want to convert only letters and digits? Default: false',
      type: 'BOOLEAN',
      required: false
    }
  ],

  run: async (_, __, interaction) => {
    const inputStr = interaction.options.getString('input');
    const input = {
      string: inputStr,
      type: await convert.getInputType(inputStr),
      options: {
        convertTo: interaction.options.getString('convert_to'),
        withSpaces: replace(interaction.options.getBoolean('with_spaces'), false),
        convertSpaces: replace(interaction.options.getBoolean('convert_spaces'), true),
        convertOnlyLettersDigits: replace(interaction.options.getBoolean('convert_letters_and_digits_only'), false)
      }
    }

    if (input.type.toLowerCase() == input.options.convertTo.toLowerCase()) {
      return interaction.editReply(
        `Converting \`${input.type.toUpperCase()}\` to \`${input.options.convertTo.toUpperCase()}\` would be a waste of time.\n` +
        `Stop wasting my time.\n` +
        `||If you input is not ${input.type.toUpperCase()}, than make sure it is valid and if it is, message the dev.||`
      )
    }

    const output = '```' + `Converted ${input.type.toUpperCase()} to ${input.options.convertTo.toUpperCase()}:` + '```\n'
    const converted = await convert[input.type][`to${input.options.convertTo}`](input);

    if (output.length + converted.length < 2000) interaction.editReply(output);
    else {
      interaction.editReply({
        content: output,
        files: [{ attachment: Buffer.from(output.replace(/```/g, '') + converted), name: 'converted.txt' }]
      });
    }

  }
})