const { PermissionFlagsBits, OverwriteType, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'unlock',
  aliases: { prefix: [], slash: [] },
  permissions: { client: ['ManageRoles'], user: ['ManageRoles'] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: true,
  options: [
    { name: 'channel', type: 'Channel' },
    { name: 'reason', type: 'String' }
  ],

  run: async function (lang, { db }) {
    const msg = await this.customReply(lang('global.loading'));

    this.args?.shift();

    const
      channel = this.options?.getChannel('channel') || this.mentions?.channels.first() || this.channel,
      reason = this.options?.getString('reason') || this.args?.join(' ') || lang('noReason'),
      oldData = db.get('guildSettings'),
      overwrites = Object.entries(oldData[this.guild.id]?.lockedChannels?.[channel.id] || [])?.filter(async ([k, v]) => {
        if (channel.permissionOverwrites.cache.get(k)?.allow.has(PermissionFlagsBits.SendMessages)) return;
        if (v == OverwriteType.Role) return (await this.guild.roles.fetch(k)).comparePositionTo(this.guild.members.me.roles.highest) < 0;
        return (await this.guild.members.fetch(k)).manageable;
      });

    if (!overwrites.length) msg.edit(lang('notLocked'));

    for (const [id, type] of overwrites) {
      await channel.permissionOverwrites.edit(id,
        { [PermissionFlagsBits.SendMessages]: true },
        { type, reason: `unlock command, moderator ${this.user.tag}` }
      );
    }

    db.update('guildSettings', `${this.guild.id}.lockedChannels.${channel.id}`, null);

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { mod: this.user.tag, reason }),
      color: Colors.Red
    });

    await channel.send({ embeds: [embed] });
    msg.edit(lang('success'));
  }
};