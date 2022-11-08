const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'embed',
  permissions: { user: ['EmbedLinks'] },
  cooldowns: { user: 100 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  dmPermission: true,
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
    let embed;

    try {
      embed = new EmbedBuilder(custom ? JSON.parse(custom) : {
        title: getOption('title'),
        description: getOption('description'),
        thumbnail: { url: getOption('thumbnail') },
        image: { url: getOption('image') },
        color: parseInt(getOption('custom_color')?.substring(1) ?? 0, 16) || getOption('predefined_color'),
        footer: { text: getOption('footer_text'), iconURL: getOption('footer_icon') },
        timestamp: this.options.getBoolean('timestamp') && Math.round(Date.now() / 1000),
        author: {
          name: getOption('author_name'),
          url: getOption('author_url'),
          iconURL: getOption('author_icon')
        },
        //fields: getOption('fields')
      });

      await this.channel.send({ content: getOption('content'), embeds: [embed] });
    }
    catch (err) { return this.editReply(lang('invalidOption', err.message)); }

    if (custom) return this.editReply(lang('successJSON'));
    this.editReply(lang('success', JSON.stringify(embed.data.filterEmpty())));
  }
};