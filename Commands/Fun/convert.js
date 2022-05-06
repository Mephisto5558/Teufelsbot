const
  { Command } = require('reconlx'),
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
        { name: 'hexadecimal', value: 'Hex' },
        { name: 'decimal/ASCII', value: 'Decimal' },
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
      choices: [{ name: 'no', value: 'no'}]
    }
  ],

  run: async(client, _, interaction) => {

    let input = {
      text: interaction.options.getString('input'),
      convertTo: interaction.options.getString('convert_to'),
    };
   
    if(interaction.options.getString('with_spaces') == 'yes') input.withSpaces = true;
    else input.withSpaces = false;
    
    if(interaction.options.getString('convert_spaces') == 'no') input.convertSpaces = false;
    else input.convertSpaces = true;

    input.type = await convert.getInputType(input.text);
    if(input.type.toLowerCase() == input.convertTo.toLowerCase())
      return interaction.followUp(`Converting ${input.type.toUpperCase()} to ${input.convertTo.toUpperCase()} would be a waste of time.\nStop wasting my time.`);
    
    let output = `Converted ${input.type.toUpperCase()} to ${input.convertTo.toUpperCase()}:\n`
    output += await convert[input.type][`to${input.convertTo}`](input);
  
    if(output.length > 2000) {
      return;
      interaction.followUp({
        content: 'The message is to large to send it in chat.',
        attachments: [{
          attachment: Buffer.from(output, 'utf-8'),
          name: 'message_converted.txt' 
        }]
      });
    }
    else interaction.followUp(output);

  }
})