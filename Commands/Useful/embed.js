const
  { AllowedMentionsTypes, Colors, DiscordAPIError, EmbedBuilder, PermissionFlagsBits, codeBlock } = require('discord.js'),
  { Command, Permissions, commandTypes } = require('@mephisto5558/command'),
  { constants, filterEmptyEntries, logSayCommandUse } = require('#Utils'),

  /** @type {(interaction: Interaction, name: string) => string | undefined} */
  getStringOption = (interaction, name) => interaction.options.getString(name)?.replaceAll('/n', '\n');

module.exports = new Command({
  types: [commandTypes.slash],
  permissions: { user: [Permissions.EmbedLinks] },
  cooldowns: { user: '200ms' },
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
      getOption = getStringOption.bind(undefined, this),
      custom = getOption('json'),
      allowedMentions = { parse: [AllowedMentionsTypes.User] };

    try {
      const
        /** @type {keyof typeof Colors | undefined} */ predefinedColorOption = getOption('predefined_color'),
        predefinedColor = predefinedColorOption ? Colors[predefinedColorOption] : undefined,
        embed = new EmbedBuilder(custom
          ? JSON.parse(custom)
          : {
              title: getOption('title'),
              description: getOption('description', true),
              thumbnail: { url: getOption('thumbnail') },
              image: { url: getOption('image') },
              color: (Number.parseInt(getOption('custom_color')?.slice(1) ?? 0, 16) || predefinedColor) ?? 0,
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

      const sentMessage = await this.channel.send({ content: getOption('content'), embeds: [embed], allowedMentions });
      await this.editReply(custom ? lang('successJSON') : lang('success', codeBlock('json', JSON.stringify(filterEmptyEntries(embed.data)))));

      return void logSayCommandUse.call(sentMessage, this.member, lang);
    }
    catch (rawErr) {
      const err = rawErr instanceof Error ? rawErr : new Error(rawErr);
      if (!(err instanceof DiscordAPIError) && !err.message.includes('JSON')) throw err;
      return this.editReply(lang('invalidOption', codeBlock(err.message)));
    }
  }
});