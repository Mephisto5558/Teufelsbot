const
  { Command } = require('reconlx'),
  convert = require('../../Functions/private/convert.js'),
  replace = (input, defaultValue) => !input && input !== false ? defaultValue : input;

module.exports = new Command({
  name: 'convert',
  aliases: { prefix: [], slash: [] },
  description: 'Converts one type of text to another',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 500 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'input',
      description: 'the text you want to convert',
      type: 'String',
      required: true
    },
    {
      name: 'convert_to',
      description: 'The output type',
      type: 'String',
      required: true,
      choices: Object.entries(convert).reduce((list, [e]) => {
        if (e != 'getInputType') list.push({ name: e, value: e.charAt(0).toUpperCase() + e.slice(1) });
        return list;
      }, []),
    },
    {
      name: 'is_octal',
      description: 'Set this to true if your input is octal or else it will be recognized as decimal.',
      type: 'Boolean',
      required: false
    },
    {
      name: 'with_spaces',
      description: 'Do you want to have spaces between the letters? Default: false',
      type: 'Boolean',
      required: false
    },
    {
      name: 'convert_spaces',
      description: 'Do you want to also convert spaces? Default: true',
      type: 'Boolean',
      required: false
    },
    {
      name: 'convert_letters_and_digits_only',
      description: 'Do you want to convert only letters and digits? Default: false',
      type: 'Boolean',
      required: false
    }
  ],

  run: async (interaction, lang) => {
    const inputStr = interaction.options.getString('input');
    const input = {
      string: inputStr,
      type: interaction.options.getBoolean('is_octal') ? 'octal' : convert.getInputType(inputStr),
      options: {
        convertTo: interaction.options.getString('convert_to'),
        withSpaces: replace(interaction.options.getBoolean('with_spaces'), false),
        convertSpaces: replace(interaction.options.getBoolean('convert_spaces'), true),
        convertOnlyLettersDigits: replace(interaction.options.getBoolean('convert_letters_and_digits_only'), false)
      }
    }

    if (input.type.toLowerCase() == input.options.convertTo.toLowerCase())
      return interaction.editReply(lang('convertToSame', input.type.toUpperCase(), input.options.convertTo.toUpperCase(), input.type.toUpperCase()));

    const output = lang('success', input.type.toUpperCase(), input.options.convertTo.toUpperCase());
    const converted = await convert[input.type][`to${input.options.convertTo}`](input);

    if (output.length + converted.length < 2000) interaction.editReply(output + converted);
    else {
      interaction.editReply({
        content: output,
        files: [{ attachment: Buffer.from(output.replace(/```/g, '') + converted), name: 'converted.txt' }]
      });
    }

  }
})