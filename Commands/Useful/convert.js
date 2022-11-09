const
  { AttachmentBuilder } = require('discord.js'),
  { Converter } = require('../../Utils');

module.exports = {
  name: 'convert',
  cooldowns: { user: 500 },
  slashCommand: true,
  prefixCommand: false,
  dmPermission: true,
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

  run: async function (lang) {
    const convertTo = this.options.getString('convert_to');
    const converter = new Converter(this.options.getString('input'), {
      withSpaces: this.options.getBoolean('with_spaces'),
      convertSpaces: this.options.getBoolean('convert_spaces'),
      convertOnlyLettersDigits: this.options.getBoolean('convert_letters_and_digits_only'),
      type: this.options.getBoolean('is_octal') && 'octal'
    });

    if (converter.type.toLowerCase() == convertTo.toLowerCase())
      return this.editReply(lang('convertToSame', { inputType: converter.type.toUpperCase(), outputType: convertTo.toUpperCase() }));
    const converted = await converter[`to${convertTo}`]();
    const output = lang('success', { inputType: converter.type.toUpperCase(), outputType: convertTo.toUpperCase() });

    if (output.length + converted.length < 2000) this.editReply(output + converted);
    else {
      this.editReply({
        content: output,
        files: [new AttachmentBuilder(Buffer.from(output.replaceAll('```', '') + converted), { name: 'converted.txt' })]
      });
    }

  }
};