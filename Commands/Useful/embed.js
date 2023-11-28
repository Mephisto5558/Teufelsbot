const
  { EmbedBuilder, Colors, PermissionFlagsBits, AllowedMentionsTypes } = require('discord.js'),
  { logSayCommandUse } = require('../../Utils');

/**@type {command}*/
module.exports = {
  name: 'embed',
  permissions: { user: ['EmbedLinks'] },
  cooldowns: { user: 200 },
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
        {
          name: 'content',
          type: 'String',
          maxLength: 2000
        },
        { name: 'title', type: 'String' },
        {
          name: 'predefined_color',
          type: 'String',
          autocompleteOptions: Object.entries(Colors).map(e => e[0]),
          strictAutocomplete: true,
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

  /**@this Interaction*/
  run: async function (lang) {
    const getOption = name => this.options.getString(name)?.replaceAll('/n', '\n');
    const custom = getOption('json');
    let embed, sentMessage;

    try {
      embed = new EmbedBuilder(custom ? JSON.parse(custom) : {
        title: getOption('title'),
        description: getOption('description'),
        thumbnail: { url: getOption('thumbnail') },
        image: { url: getOption('image') },
        color: parseInt(getOption('custom_color')?.substring(1) ?? 0, 16) || Colors[getOption('predefined_color')] || 0,
        footer: { text: getOption('footer_text'), iconURL: getOption('footer_icon') },
        timestamp: this.options.getBoolean('timestamp') && Math.round(Date.now() / 1000),
        author: {
          name: getOption('author_name'),
          url: getOption('author_url'),
          iconURL: getOption('author_icon')
        }
        //fields: getOption('fields')
      });

      let allowedMentions = { parse: [AllowedMentionsTypes.User] };
      if (this.member.permissionsIn(this.channel).has(PermissionFlagsBits.MentionEveryone)) {
        allowedMentions.parse.push(AllowedMentionsTypes.Role);
        allowedMentions.parse.push(AllowedMentionsTypes.Everyone);
      }

      sentMessage = await this.channel.send({ content: getOption('content'), embeds: [embed], allowedMentions });
    }
    catch (err) { return this.editReply(lang('invalidOption', err.message)); }

    await this.editReply(custom ? lang('successJSON') : lang('success', JSON.stringify(embed.data.filterEmpty())));
    return logSayCommandUse.call(sentMessage, this.member, lang);
  }
};