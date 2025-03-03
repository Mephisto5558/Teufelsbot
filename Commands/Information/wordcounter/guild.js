const
  { EmbedBuilder, bold, time, TimestampStyles } = require('discord.js'),
  { commandMention } = require('#Utils'),
  { getTopChannels, getTopMembers } = require('./_utils');

/** @type {import('.').default} */
module.exports = {
  options: [{
    name: 'get',
    type: 'Subcommand',
    options: [{
      name: 'guild_id',
      type: 'String',
      autocompleteOptions: function () {
        return this.client.guilds.cache
          .filter(e => e.members.cache.has(this.user.id))
          .map(e => ({ name: e.name, value: e.id }));
      },
      strictAutocomplete: true
    }]
  }],

  async run(lang) {
    const guild = this.client.guilds.cache.get(this.options.getString('guild_id') ?? this.guild?.id);
    if (!guild) return this.customReply(lang('invalidGuild'));
    if (!guild.db.wordCounter?.enabled) {
      const command = this.client.slashCommands.get('setup');
      return this.customReply(lang('notEnabled', commandMention(`${command.name} ${this.command.name}`, command.id)));
    }

    const
      embed = new EmbedBuilder({
        title: lang('embedTitle', guild.name),
        thumbnail: { url: this.guild.iconURL() },
        description: lang('embedDescription', { enabledAt: time(this.guild.db.wordCounter.enabledAt, TimestampStyles.ShortDateTime), amount: bold(this.guild.db.wordCounter.sum) })
      }),
      channelEmbed = new EmbedBuilder({
        title: lang('channelEmbedTitle'),
        description: lang('channelEmbedDescription'),
        fields: getTopChannels.call(this, lang, guild, 10)
      }),
      memberEmbed = new EmbedBuilder({
        title: lang('memberEmbedTitle'),
        description: lang('memberEmbedDescription'),
        fields: getTopMembers.call(this, lang, guild, 10)
      });

    return this.customReply({ embeds: [embed, channelEmbed, memberEmbed] });
  }
};