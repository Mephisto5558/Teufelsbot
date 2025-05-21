const
  { EmbedBuilder, Colors, PermissionFlagsBits, AllowedMentionsTypes, DiscordAPIError, codeBlock } = require('discord.js'),
  { logSayCommandUse, constants } = require('#Utils');

/**
 * @param {Interaction}interaction
 * @param {string}name */
// 2nd const keyword because of intellisense
const getStringOption = (interaction, name) => interaction.options.getString(name)?.replaceAll('/n', '\n');

/** @type {command<'slash', false>} */
module.exports = {
  permissions: { user: ['EmbedLinks'] },
  /* eslint-disable-next-line @typescript-eslint/no-magic-numbers */
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
          maxLength: constants.messageMaxLength
        },
        { name: 'title', type: 'String' },
        {
          name: 'predefined_color',
          type: 'String',
          autocompleteOptions: Object.entries(Colors).map(e => e[0]),
          strictAutocomplete: true
        },
        { name: 'custom_color', type: 'String' },
        { name: 'footer_text', type: 'String' },
        { name: 'footer_icon', type: 'String' },
        { name: 'image', type: 'String' },
        { name: 'thumbnail', type: 'String' },
        { name: 'timestamp', type: 'Boolean' },
        { name: 'author_name', type: 'String' },
        { name: 'author_url', type: 'String' },
        { name: 'author_icon', type: 'String' }
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

  async run(lang) {
    const

      /** @type {(name: string) => string | undefined} */
      getOption = getStringOption.bind(undefined, this),
      custom = getOption('json'),
      allowedMentions = { parse: [AllowedMentionsTypes.User] };

    let embed, sentMessage;

    try {
      embed = new EmbedBuilder(custom
        ? JSON.parse(custom)
        : {
          title: getOption('title'),
          description: getOption('description', true),
          thumbnail: { url: getOption('thumbnail') },
          image: { url: getOption('image') },
          color: (Number.parseInt(getOption('custom_color')?.slice(1) ?? 0, 16) || Colors[getOption('predefined_color')]) ?? 0,
          footer: { text: getOption('footer_text'), iconURL: getOption('footer_icon') },
          timestamp: this.options.getBoolean('timestamp') && Date.now(),
          author: {
            name: getOption('author_name'),
            url: getOption('author_url'),
            iconURL: getOption('author_icon')
          }
        });

      if (this.member.permissionsIn(this.channel).has(PermissionFlagsBits.MentionEveryone))
        allowedMentions.parse.push(AllowedMentionsTypes.Role, AllowedMentionsTypes.Everyone);


      sentMessage = await this.channel.send({ content: getOption('content'), embeds: [embed], allowedMentions });
    }
    catch (err) {
      if (!(err instanceof DiscordAPIError) && !err.message?.includes('JSON at')) throw err;
      return this.editReply(lang('invalidOption', codeBlock(err.message)));
    }

    await this.editReply(custom ? lang('successJSON') : lang('success', codeBlock('json', JSON.stringify(embed.data.filterEmpty()))));
    return logSayCommandUse.call(sentMessage, this.member, lang);
  }
};