const { PermissionFlagsBits, OverwriteType, EmbedBuilder, Colors } = require('discord.js');

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

  run: async function (lang, { db }) {
    const msg = await this.customReply(lang('global.loading'));

    this.args?.shift();

    const
      channel = this.options?.getChannel('channel') || this.mentions?.channels.first() || this.channel,
      reason = this.options?.getString('reason') || this.args?.join(' ') || lang('noReason'),
      overwrites = Object.assign({}, ...channel.permissionOverwrites.cache.filter(async e => {
        if (!e.allow.has(PermissionFlagsBits.SendMessages) || e.allow.has(PermissionFlagsBits.Administrator)) return;
        if (e.type == OverwriteType.Role) return (await this.guild.roles.fetch(e.id)).comparePositionTo(this.guild.members.me.roles.highest) < 0;
        return (await this.guild.members.fetch(e.id)).manageable;
      }).map(e => ({ [e.id]: e.type })));

    if (channel.permissionOverwrites.resolve(this.guild.roles.everyone.id)?.allow.has(PermissionFlagsBits.SendMessages))
      overwrites[this.guild.roles.everyone.id] = OverwriteType.Role;

    db.update('guildSettings', `${this.guild.id}.lockedChannels.${channel.id}`, overwrites);

    for (const [id, type] of Object.entries(overwrites)) {
      await channel.permissionOverwrites.edit(id,
        { [PermissionFlagsBits.SendMessages]: false },
        { type, reason: `lock command, moderator ${this.user.tag}` }
      );
    }

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { mod: this.user.tag, reason }),
      color: Colors.Red
    });

    await channel.send({ embeds: [embed] });
    msg.edit(lang('success'));
  }
};