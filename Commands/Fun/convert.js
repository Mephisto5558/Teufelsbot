const { Command } = require('reconlx'), { MessageAttachment } = require('discord.js'),
  convert = require('../../Functions/private/convert.js');

module.exports = new Command({
  name: 'convert',
  alias: [],
  description: 'Converts one type of text to another',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: 'FUN',
  slashCommand: true,
  prefixCommand: false,
  disabled: false,
  options: [{
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
        { name: 'hash', value: 'hash'},
        { name: 'hexadecimal', value: 'Hex' },
        { name: 'text', value: 'Text' }
      ],
    },
    {
      name: 'with_spaces',
      description: 'Do you want to have spaces between the letters? Default: no',
      type: 'STRING',
      required: false,
      choices: [{ name: 'yes', value: 'yes' }]
    },
    {
      name: 'convert_spaces',
      description: 'Do you want to also convert spaces? Default: yes',
      type: 'STRING',
      required: false,
      choices: [{ name: 'no', value: 'no' }]
    },
    {
      name: 'convert_letters_and_digits_only',
      description: 'Do you want to convert only letters and digits? Default: no',
      type: 'STRING',
      required: false,
      choices: [{ name: 'yes', value: 'yes' }]
    }
  ],

  run: async(client, _, interaction) => {

    function replace(input, defaultValue) {
      if(!input) return defaultValue;
      return input.replace('yes', true).replace('no', false);
    }

    let inputStr = interaction.options.getString('input');

    let input = {
      string: inputStr,
      type: await convert.getInputType(inputStr),
      options: {
        convertTo: interaction.options.getString('convert_to'),
        withSpaces: replace(interaction.options.getString('with_spaces'), false),
        convertSpaces: replace(interaction.options.getString('convert_spaces'), true),
        convertOnlyLettersDigits: replace(interaction.options.getString('convert_letters_and_digits_only'), false)
      }
    };

    if(input.type.toLowerCase() == input.options.convertTo.toLowerCase())
      return interaction.followUp(
        `Converting ${input.type.toUpperCase()} to ${input.options.convertTo.toUpperCase()} would be a waste of time.\n` +
        `Stop wasting my time.\n` +
        `||If you input is not ${input.type.toUpperCase()}, than make sure it is valid and if it is, ping the dev.||`
      );

    let output = '```' + `Converted ${input.type.toUpperCase()} to ${input.options.convertTo.toUpperCase()}:` + '```\n'
    output += await convert[input.type][`to${input.options.convertTo}`](input);

    if(output.length > 2000) {
      interaction.followUp({
        content: 'The message is to large to send it in chat.',
        attachments: [new MessageAttachment(Buffer.from(output), 'message.txt')]
      });
    } else interaction.followUp(output);

  }
})