/** @import subcommand from '.' */

const
  { Colors, EmbedBuilder, MessageFlags, TimestampStyles, bold, time } = require('discord.js'),
  { commandMention } = require('#Utils'),
  { getTopGuilds } = require('./_utils');

/** @type {subcommand} */
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
    lang.config.backupPaths.push(`${lang.config.backupPaths.at(-1)}.${this.options.getSubcommand(true)}`);

    if (this.options.getSubcommand(true) == 'enable') {
      const enabled = this.options.getBoolean('enabled', true);
      await (this.user.db.wordCounter
        ? this.user.updateDB('wordCounter.enabled', enabled)
        : this.user.updateDB('wordCounter', { enabled, enabledAt: enabled ? undefined : new Date(), sum: 0, guilds: {} })
      );

      return this.customReply(lang('success', lang(`global.${enabled ? 'enabled' : 'disabled'}`)));
    }

    if (!this.user.db.wordCounter?.enabled) {
      return this.customReply(lang(
        'notEnabledUser', commandMention(`${this.command.name} ${this.options.getSubcommandGroup()} enable`, this.command.id)
      ));
    }

    const
      embed = new EmbedBuilder({
        title: lang('embedTitle', this.member.displayName),
        thumbnail: { url: this.user.displayAvatarURL() },
        description: lang('embedDescription', {
          enabledAt: time(this.user.db.wordCounter.enabledAt, TimestampStyles.ShortDateShortTime),
          amount: bold(this.user.db.wordCounter.sum)
        }),
        color: Colors.Blurple
      }),
      guildEmbed = new EmbedBuilder({
        title: lang('guildEmbedTitle'),
        description: lang('guildEmbedDescription', 10),
        color: Colors.Blurple,
        fields: getTopGuilds(this.user, 10)
      });

    await this.customReply({ embeds: [embed] });
    return this.followUp({ embeds: [guildEmbed], flags: MessageFlags.Ephemeral });
  }
};