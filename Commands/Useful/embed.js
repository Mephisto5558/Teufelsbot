const { EmbedBuilder, Colors } = require('discord.js');

const call = (fn, ...args) => fn(...args);
const filterEmpty = obj => Object(obj) !== obj ? obj
  : Object.fromEntries(Object.entries(obj).flatMap(([k, v]) => call((val = filterEmpty(v)) => !(val == null || (Object(val) === val && Object.keys(val).length == 0)) ? [[k, val]] : [])));

module.exports = {
  name: 'embed',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: ['EmbedLinks'] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'custom',
      type: 'Subcommand',
      options: [
        {
          name: 'description',
          type: 'String',
          required: true
        },
        { name: 'content', type: 'String' },
        { name: 'title', type: 'String' },
        {
          name: 'predefined_color',
          type: 'String',
          choices: Object.entries(Colors).map(([k, v]) => ({ name: k, value: v.toString() })).slice(0, 25),
        },
        { name: 'custom_color', type: 'String' },
        { name: 'footer_text', type: 'String' },
        { name: 'footer_icon', type: 'String' },
        { name: 'image', type: 'String' },
        { name: 'thumbnail', type: 'String' },
        { name: 'timestamp', type: 'Boolean' },
        { name: 'author_name', type: 'String' },
        { name: 'author_url', type: 'String' },
        { name: 'author_icon', type: 'String' },
        //{ name: 'fields', type: 'String' }
      ]
    },
    {
      name: 'json',
      type: 'Subcommand',
      options: [{
        name: 'json',
        type: 'String',
        required: true
      }]
    }
  ],

  run: async function (lang) {
    const getOption = name => this.options.getString(name)?.replaceAll('/n', '\n');
    const custom = getOption('json');
    const content = getOption('content');
    let embed;

    try {
      embed = new EmbedBuilder(custom ? JSON.parse(custom) : {
        title: getOption('title'),
        description: getOption('description'),
        color: parseInt(getOption('custom_color')?.substring(1) ?? 0, 16) || getOption('predefined_color'),
        footer: { text: getOption('footer_text'), iconURL: getOption('footer_icon') },
        timestamp: this.options.getBoolean('timestamp') ? Math.round(Date.now() / 1000) : null,
        author: {
          name: getOption('author_name'),
          url: getOption('author_url'),
          iconURL: getOption('author_icon')
        },
        //fields: getOption('fields')
      })
        .setThumbnail(getOption('thumbnail'))
        .setImage(getOption('image'));

      await this.channel.send({ content, embeds: [embed] });
    }
    catch (err) { return this.editReply(lang('invalidOption', err.message)); }

    if (custom) return this.editReply(lang('successJSON'));
    this.editReply(lang('success', JSON.stringify(filterEmpty(embed.data))));
  }
};