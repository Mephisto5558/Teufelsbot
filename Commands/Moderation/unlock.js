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

  run: async (message, lang, { db }) => {
    const msg = await message.customReply(lang('global.loading'));

    message.args?.shift();

    const
      channel = message.options?.getChannel('channel') || message.mentions?.channels.first() || message.channel,
      reason = message.options?.getString('reason') || message.args?.join(' ') || lang('noReason'),
      oldData = db.get('guildSettings'),
      overwrites = Object.entries(oldData[message.guild.id]?.lockedChannels?.[channel.id] || [])?.filter(async ([k, v]) => {
        if (channel.permissionOverwrites.cache.get(k)?.allow.has(PermissionFlagsBits.SendMessages)) return;
        if (v == OverwriteType.Role) return (await message.guild.roles.fetch(k)).comparePositionTo(message.guild.members.me.roles.highest) < 0;
        return (await message.guild.members.fetch(k)).manageable;
      });

    if (!overwrites.length) msg.edit(lang('notLocked'));

    for (const [id, type] of overwrites) {
      await channel.permissionOverwrites.edit(id,
        { [PermissionFlagsBits.SendMessages]: true },
        { type, reason: `unlock command, moderator ${message.user.tag}` }
      );
    }

    delete oldData[message.guild.id].lockedChannels[channel.id];
    db.set('guildSettings', oldData);

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { mod: message.user.tag, reason }),
      color: Colors.Red
    });

    await channel.send({ embeds: [embed] });
    msg.edit(lang('success'));
  }
}