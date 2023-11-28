const { PermissionFlagsBits, OverwriteType, EmbedBuilder, Colors } = require('discord.js');

/**@type {command}*/
module.exports = {
  name: 'unlock',
  permissions: { client: ['ManageRoles'], user: ['ManageRoles'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [
    { name: 'channel', type: 'Channel' },
    { name: 'reason', type: 'String' }
  ],

  /**@this GuildInteraction|GuildMessage*/
  run: async function (lang) {
    this.args?.shift();

    const
      msg = await this.customReply(lang('global.loading')),
      channel = this.options?.getChannel('channel') || this.mentions?.channels.first() || this.channel,
      reason = this.options?.getString('reason') || this.args?.join(' ') || lang('noReason'),
      overwrites = Object.entries(this.guild.db.lockedChannels?.[channel.id] || {})?.filter(async ([k, v]) => {
        if (channel.permissionOverwrites.cache.get(k)?.allow.has(PermissionFlagsBits.SendMessages)) return;
        if (v == OverwriteType.Role) return (await this.guild.roles.fetch(k))?.position - this.guild.members.me.roles.highest.position < 0;
        return (await this.guild.members.fetch(k)).manageable;
      });

    if (!overwrites.length) return msg.edit(lang('notLocked'));

    for (const [id, type] of overwrites) await channel.permissionOverwrites.edit(id,
      { [PermissionFlagsBits.SendMessages]: true },
      { type, reason: lang('global.modReason', { command: this.commandName, user: this.user.tag }) }
    );

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { mod: this.user.tag, reason }),
      color: Colors.Red
    });

    await this.client.db.update('guildSettings', `${this.guild.id}.lockedChannels.${channel.id}`, {});

    await channel.send({ embeds: [embed] });
    return msg.edit(lang('success'));
  }
};