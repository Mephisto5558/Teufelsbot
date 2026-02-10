const
  { AllowedMentionsTypes, Colors, DiscordAPIError, EmbedBuilder, PermissionFlagsBits, codeBlock } = require('discord.js'),
  { Command, OptionType, Permissions, commandTypes } = require('@mephisto5558/command'),
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
      type: OptionType.Subcommand,
      options: [
        {
          name: 'description',
          type: OptionType.String,
          required: true
        },
        {
          name: 'content',
          type: OptionType.String,
          maxLength: constants.messageMaxLength
        },
        { name: 'title', type: OptionType.String },
        {
          name: 'predefined_color',
          type: OptionType.String,
          autocompleteOptions: Object.entries(Colors).map(e => e[0]),
          strictAutocomplete: true
        },
        { name: 'custom_color', type: OptionType.String },
        { name: 'footer_text', type: OptionType.String },
        { name: 'footer_icon', type: OptionType.String },
        { name: 'image', type: OptionType.String },
        { name: 'thumbnail', type: OptionType.String },
        { name: 'timestamp', type: OptionType.Boolean },
        { name: 'author_name', type: OptionType.String },
        { name: 'author_url', type: OptionType.String },
        { name: 'author_icon', type: OptionType.String }
      ]
    },
    {
      name: 'json',
      type: OptionType.Subcommand,
      options: [{
        name: 'json',
        type: OptionType.String,
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