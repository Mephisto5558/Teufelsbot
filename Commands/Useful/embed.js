const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js');

function filterEmptyEntries(obj) {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => typeof v == 'object' ? Object.entries(v ?? '').length : v?.toString().length)
      .map(([k, v]) => [k, typeof v == 'object' && !Array.isArray(v) ? filterEmptyEntries(v) : v])
  );
}

module.exports = new Command({
  name: 'embed',
  aliases: { prefix: [], slash: [] },
  description: 'sends a custom embed; you can do newlines with "/n"',
  usage: '',
  permissions: { client: ['EmbedLinks'], user: ['EmbedLinks'] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'custom',
      description: 'create your own embed with a bunch of options',
      type: 'Subcommand',
      options: [
        {
          name: 'description',
          description: 'set the embed text, use "/n" for newlines',
          type: 'String',
          required: true
        },
        {
          name: 'content',
          description: 'set a message outside of the embed',
          type: 'String',
          required: false
        },
        {
          name: 'title',
          description: 'set the embed title',
          type: 'String',
          required: false
        },
        {
          name: 'predefined_color',
          description: 'set the embed color from predefined hex codes',
          type: 'String',
          choices: Object.entries(Colors).map(([k, v]) => ({ name: k, value: v.toString() })).slice(0, 25),
          required: false
        },
        {
          name: 'custom_color',
          description: 'set a custom 6-char HEX Code as embed color (e.g. #ffffff)',
          type: 'String',
          required: false
        },
        {
          name: 'footer_text',
          description: 'set the footer text',
          type: 'String',
          required: false
        },
        {
          name: 'footer_icon',
          description: 'set the footer icon URL',
          type: 'String',
          required: false
        },
        {
          name: 'image',
          description: 'set the embed image URL',
          type: 'String',
          required: false
        },
        {
          name: 'thumbnail',
          description: 'set the thumbnail URL',
          type: 'String',
          required: false
        },
        {
          name: 'timestamp',
          description: 'set the timestamp',
          type: 'Boolean',
          required: false
        },
        {
          name: 'author_name',
          description: 'set the author name',
          type: 'String',
          required: false
        },
        {
          name: 'author_url',
          description: 'set the author URL',
          type: 'String',
          required: false
        },
        {
          name: 'author_icon',
          description: 'set the author icon URL',
          type: 'String',
          required: false
        },
        /*{
          name: 'fields',
          description: 'set fields. Format: {"name": "<name here>",<value (text)>;;<inline (boolean)>}&&{next one like first}...',
          type: 'String',
          required: false
        }*/
      ]
    },
    {
      name: 'json',
      description: 'create an embed from raw JSON data',
      type: 'Subcommand',
      options: [{
        name: 'json',
        description: 'JSON data to create an embed from',
        type: 'String',
        required: true
      }]
    }
  ],

  run: async (_, interaction) => {
    const getOption = name => interaction.options.getString(name)?.replace(/\/n/g, '\n');
    const custom = getOption('json');
    const content = getOption('content');
    let embed;

    try {
      embed = new EmbedBuilder(custom ? JSON.parse(custom) : {
        title: getOption('title'),
        description: getOption('description'),
        color: parseInt(getOption('custom_color')?.substring(1) ?? 0, 16) || getOption('predefined_color'),
        footer: { text: getOption('footer_text'), iconURL: getOption('footer_icon') },
        timestamp: interaction.options.getBoolean('timestamp') ? Date.now() / 1000 : null,
        author: {
          name: getOption('author_name'),
          url: getOption('author_url'),
          iconURL: getOption('author_icon')
        },
        //fields: getOption('fields')
      })
        .setThumbnail(getOption('thumbnail'))
        .setImage(getOption('image'));

      await interaction.channel.send({ content: content, embeds: [embed] });
    }
    catch (err) {
      return interaction.editReply(
        '**One of the provided embed options is invalid!**\n\n' +
        '```' + err + '```'
      )
    }

    if (custom) interaction.editReply('Your embed has been sent!');
    else {
      embed = JSON.stringify(filterEmptyEntries(embed.data));

      interaction.editReply(
        'Your embed has been sent! Below is the embed code.\n' +
        'if you want to send it again, use the `json` subcommand.\n\n' +
        '```json\n' + embed + '\n```'
      )
    }
  }
});