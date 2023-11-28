const { PermissionFlagsBits, OverwriteType, EmbedBuilder, Colors } = require('discord.js');

/**@type {command}*/
module.exports = {
  name: 'lock',
  permissions: { client: ['ManageRoles'], user: ['ManageRoles'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true, beta: true,
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
      overwrites = await channel.permissionOverwrites.cache.reduce(async (acc, e) => {
        if (!e.allow.has(PermissionFlagsBits.SendMessages) || e.allow.has(PermissionFlagsBits.Administrator)) return acc;
        if (e.type == OverwriteType.Role) return (await this.guild.roles.fetch(e.id))?.position - this.guild.members.me.roles.highest.position < 0 ? { ...(await acc), [e.id]: e.type } : acc;
        return (await this.guild.members.fetch(e.id)).manageable ? { ...(await acc), [e.id]: e.type } : acc;
      }, Promise.resolve({}));

    if (channel.permissionOverwrites.resolve(this.guild.roles.everyone.id)?.allow.has(PermissionFlagsBits.SendMessages))
      overwrites[this.guild.roles.everyone.id] = OverwriteType.Role;

    await this.client.db.update('guildSettings', `${this.guild.id}.lockedChannels.${channel.id}`, overwrites);

    for (const [id, type] of Object.entries(overwrites)) await channel.permissionOverwrites.edit(id,
      { [PermissionFlagsBits.SendMessages]: false },
      { type, reason: lang('global.modReason', { command: this.commandName, user: this.user.tag }) }
    );

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { mod: this.user.tag, reason }),
      color: Colors.Red
    });

    await channel.send({ embeds: [embed] });
    return msg.edit(lang('success'));
  }
};