const { Command } = require("reconlx");
const { MessageEmbed } = require('discord.js');
const colorConfig = require('../../Settings/embed.json').colors;

function pushColors(colorObject) { //is not called in code
  for (let color of Object.entries(colorObject)) {
    let choices = command.options[0].options[2].choices;

    if (choices?.length == 25) break;

    if (typeof color[1] == 'object') pushColors(color[1]);
    else if (!/^#[A-F0-9]{6}$/i.test(color[1])) continue;
    else choices.push({ name: color[0], value: color[1].toString() });
  }
}

let command = new Command({
  name: 'embed',
  aliases: [],
  description: 'sends a custom embed; you can do newlines with "/n"',
  usage: '',
  permissions: { client: [], user: ['EMBED_MESSAGES'] },
  cooldowns: { global: '', user: '' },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'custom',
      description: 'create your own embed with a bunch of options',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'description',
          description: 'set the embed text',
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
          choices: [], //gets dynamically set from colorConfig, must be index 2
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
        {
          name: 'fields',
          description: 'Fields are not supported yet. Tell the dev you want to use this to motivate him.',//'set fields. Format: {"name": "<name here>",<value (text)>;;<inline (boolean)>}&&{next one like first}...',
          type: 'STRING',
          required: false //TOOOOOOOOOOODOOOOOOOO
        }
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
    function option(name) { return interaction.options.getString(name)?.replace(/\/n/g,'\n') };
    let custom = option('json');
    let timestamp;
    if(interaction.options.getBoolean('timestamp')) timestamp = new Date();
    let embed;

    try {

      if (custom) embed = new MessageEmbed(JSON.parse(custom));
      else {
        embed = new MessageEmbed({
          title: option('title'),
          description: option('description'),
          color: option('custom_color') || option('predefined_color'),
          footer: { text: option('footer_text'), iconURL: option('footer_icon') },
          image: option('image'),
          thumbnail: option('thumbnail'),
          timestamp: timestamp,
          author: { name: option('author_name'), url: option('author_url'), iconURL: option('author_icon') },
          //fields: option('fields')
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

    embed = JSON.stringify(
      Object.fromEntries(
        Object.entries(embed)
          .filter(([_, b]) => b != null && b.length)
      )
    );

    interaction.editReply(
      'Your embed has been sent! below is the embed code.\n' +
      'if you want to send it again, use the `json` option.\n\n' +
      '```json\n' + embed + '\n```'
    )
  }
})

pushColors(colorConfig);
module.exports = command;