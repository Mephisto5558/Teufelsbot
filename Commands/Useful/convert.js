const
  Converter = require('../../Functions/private/converter.js'),
  replace = (input, defaultValue) => !input && input !== false ? defaultValue : input;

module.exports = {
  name: 'convert',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 500 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'input',
      type: 'String',
      required: true
    },
    {
      name: 'convert_to',
      type: 'String',
      required: true,
      choices: Object.entries(Converter).reduce((list, [e]) => {
        list.push({ name: e, value: e.charAt(0).toUpperCase() + e.slice(1) });
        return list;
      }, []),
    },
    { name: 'is_octal', type: 'Boolean' },
    { name: 'with_spaces', type: 'Boolean' },
    { name: 'convert_spaces', type: 'Boolean' },
    { name: 'convert_letters_and_digits_only', type: 'Boolean' }
  ],

  run: async (interaction, lang) => {
    const inputStr = interaction.options.getString('input');
    const input = {
      string: inputStr,
      type: interaction.options.getBoolean('is_octal') ? 'octal' : Converter.getInputType(inputStr),
      options: {
        convertTo: interaction.options.getString('convert_to'),
        withSpaces: replace(interaction.options.getBoolean('with_spaces'), false),
        convertSpaces: replace(interaction.options.getBoolean('convert_spaces'), true),
        convertOnlyLettersDigits: replace(interaction.options.getBoolean('convert_letters_and_digits_only'), false)
      }
    }

    if (input.type.toLowerCase() == input.options.convertTo.toLowerCase())
      return interaction.editReply(lang('convertToSame', { inputType: input.type.toUpperCase(), outputType: input.options.convertTo.toUpperCase() }));
    const converted = await Converter[input.type][`to${input.options.convertTo}`](input);
    const output = lang('success', { inputType: input.type.toUpperCase(), outputType: input.options.convertTo.toUpperCase() });

    if (output.length + converted.length < 2000) interaction.editReply(output + converted);
    else {
      interaction.editReply({
        content: output,
        files: [{ attachment: Buffer.from(output.replaceAll('```', '') + converted), name: 'converted.txt' }]
      });
    }

  }
}