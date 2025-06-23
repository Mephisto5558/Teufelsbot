const
  { EmbedBuilder, bold, time, TimestampStyles, MessageFlags } = require('discord.js'),
  { commandMention } = require('#Utils'),
  { getTopGuilds } = require('./_utils');

/** @type {import('.').default} */
module.exports = {
  options: [
    {
      name: 'enable',
      type: 'Subcommand',
      options: [{
        name: 'enabled',
        type: 'Boolean',
        required: true
      }]
    },
    { name: 'get', type: 'Subcommand' }
  ],

  async run(lang) {
    lang.__boundArgs__[0].backupPath.push(`${lang.__boundArgs__[0].backupPath.at(-1)}.${this.options.getSubcommand(true)}`);

    if (this.options.getSubcommand(true) == 'enable') {
      const enabled = this.options.getBoolean('enabled', true);
      await (this.user.db.wordCounter
        ? this.user.updateDB('wordCounter.enabled', enabled)
        : this.user.updateDB('wordCounter', { enabled, enabledAt: enabled ? undefined : new Date(), sum: 0, guilds: {} })
      );

      return this.customReply(lang('success', lang(`global.${enabled ? 'enabled' : 'disabled'}`)));
    }

    if (!this.user.db.wordCounter?.enabled)
      return this.customReply(lang('notEnabledUser', commandMention(`${this.command.name} ${this.options.getSubcommandGroup()} enable`, this.command.id)));

    const
      embed = new EmbedBuilder({
        title: lang('embedTitle', this.user.customName),
        thumbnail: { url: this.user.displayAvatarURL() },
        description: lang('embedDescription', {
          enabledAt: time(this.user.db.wordCounter.enabledAt, TimestampStyles.ShortDateTime),
          amount: bold(this.user.db.wordCounter.sum)
        })
      }),
      guildEmbed = new EmbedBuilder({
        title: lang('guildEmbedTitle'),
        description: lang('guildEmbedDescription', 10),
        fields: getTopGuilds.call(this, lang, this.user, 10)
      });

    await this.customReply({ embeds: [embed] });
    return this.followUp({ embeds: [guildEmbed], flags: MessageFlags.Ephemeral });
  }
};