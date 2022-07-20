const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js');

function filterEmptyEntries(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k, a]) => {
      if (!a?.toString().length || k == 'type' || (typeof a == 'number' && a == 0)) return;

      if (typeof a == 'object') {
        a = filterEmptyEntries(a);
        if (!Object.values(a).length) return;
      }

      return true;
    })
  )
}

module.exports = new Command({
  name: 'embed',
  aliases: { prefix: [], slash: [] },
  description: 'sends a custom embed; you can do newlines with "/n"',
  usage: '',
  permissions: { client: ['EMBED_LINKS'], user: ['EMBED_LINKS'] },
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
          name: 'content',
          description: 'set a message outside of the embed',
          type: 'String',
          required: false
        },
        {
          name: 'description',
          description: 'set the embed text, use "/n" for newlines',
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

  run: async (_, __, interaction) => {
    function getOption(name) {
      return interaction.options.getString(name)?.replace(/\/n/g, '\n');
    }

    const custom = getOption('json');
    const content = getOption('content');
    let embed;

    try {
      if (custom) embed = new EmbedBuilder(JSON.parse(custom.embeds[0]));
      else {
        embed = new EmbedBuilder({
          title: getOption('title'),
          description: getOption('description') || ' ',
          color: getOption('custom_color') || parseInt(getOption('predefined_color').substring(1), 16),
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
      }

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
      embed = JSON.stringify(filterEmptyEntries({ content: content, embeds: [embed] }));

      interaction.editReply(
        'Your embed has been sent! Below is the embed code.\n' +
        'if you want to send it again, use the `json` subcommand.\n\n' +
        '```json\n' + embed + '\n```'
      )
    }

  }
});