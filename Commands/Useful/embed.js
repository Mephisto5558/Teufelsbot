const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  { colors } = require('../../Settings/embed.json');

function pushColors(colorObject) { //is not called in code
  for (const color of Object.entries(colorObject)) {
    let choices = command.options[0].options[2].choices;

    if (choices?.length == 25) break;

    if (typeof color[1] == 'object') pushColors(color[1]);
    else if (!/^#[A-F0-9]{6}$/i.test(color[1])) continue;
    else choices.push({ name: color[0], value: color[1].toString() });
  }
}

function filterEmptyEntries(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, a]) => {
      if(!a?.toString().length || k == 'type'|| (typeof a == 'number' && a == 0)) return;
      
      if(typeof a == 'object') {
        a = filterEmptyEntries(a);
        if(!Object.values(a).length) return;
      }

      return true;
    })
  )
}

let command = new Command({
  name: 'embed',
  aliases: [],
  description: 'sends a custom embed; you can do newlines with "/n"',
  usage: '',
  permissions: { client: [], user: ['EMBED_LINKS'] },
  cooldowns: { global: '', user: '' },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true, beta:true,////////////////
  options: [
    {
      name: 'custom',
      description: 'create your own embed with a bunch of options',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'description',
          description: 'set the embed text, use "/n" for newlines',
          type: 'STRING',
          required: true
        },
        {
          name: 'title',
          description: 'set the embed title',
          type: 'STRING',
          required: false
        },
        {
          name: 'predefined_color',
          description: 'set the embed color from predefined hex codes',
          type: 'STRING',
          choices: [], //gets dynamically set from colors, must be index 2
          required: false
        },
        {
          name: 'custom_color',
          description: 'set a custom HEX Code as embed color',
          type: 'STRING',
          required: false
        },
        {
          name: 'footer_text',
          description: 'set the footer text',
          type: 'STRING',
          required: false
        },
        {
          name: 'footer_icon',
          description: 'set the footer icon URL',
          type: 'STRING',
          required: false
        },
        {
          name: 'image',
          description: 'set the embed image URL',
          type: 'STRING',
          required: false
        },
        {
          name: 'thumbnail',
          description: 'set the thumbnail URL',
          type: 'STRING',
          required: false
        },
        {
          name: 'timestamp',
          description: 'set the timestamp',
          type: 'BOOLEAN',
          required: false
        },
        {
          name: 'author_name',
          description: 'set the author name',
          type: 'STRING',
          required: false
        },
        {
          name: 'author_url',
          description: 'set the author URL',
          type: 'STRING',
          required: false
        },
        {
          name: 'author_icon',
          description: 'set the author icon URL',
          type: 'STRING',
          required: false
        },
        /*{
          name: 'fields',
          description: 'set fields. Format: {"name": "<name here>",<value (text)>;;<inline (boolean)>}&&{next one like first}...',
          type: 'STRING',
          required: false
        }*/
      ]
    },
    {
      name: 'json',
      description: 'create an embed from raw JSON data',
      type: 'SUB_COMMAND',
      options: [{
        name: 'json',
        description: 'JSON data to create an embed from',
        type: 'STRING',
        required: true
      }],
    }
  ],

  run: async (_, __, interaction) => {
    function getOption(name) {
      return interaction.options.getString(name)?.replace(/\/n/g, '\n');
    }

    const custom = getOption('json');
    let embed;

    try {
      if (custom) embed = new MessageEmbed(JSON.parse(custom));
      else {
        embed = new MessageEmbed({
          title: getOption('title'),
          description: getOption('description'),
          color: getOption('custom_color') || getOption('predefined_color'),
          footer: { text: getOption('footer_text'), iconURL: getOption('footer_icon') },
          image: getOption('image'),
          thumbnail: getOption('thumbnail'),
          timestamp: interaction.options.getBoolean('timestamp') ? timestamp = new Date() : null,
          author: {
            name: getOption('author_name'),
            url: getOption('author_url'),
            iconURL: getOption('author_icon')
          },
          //fields: getOption('fields')
        })
      }

      await interaction.channel.send({ embeds: [embed] });
    }
    catch (err) {
      return interaction.editReply(
        '**One of the provided embed options is invalid!**\n\n' +
        '```' + err + '```'
      )
    }

    if (custom) interaction.editReply('Your embed has been sent!');
    else {
      embed = JSON.stringify(filterEmptyEntries(embed));

      interaction.editReply(
        'Your embed has been sent! Below is the embed code.\n' +
        'if you want to send it again, use the `json` subcommand.\n\n' +
        '```json\n' + embed + '\n```'
      )
    }

  }
});


pushColors(colors);
module.exports = command;