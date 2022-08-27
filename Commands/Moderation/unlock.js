const { PermissionFlagsBits, OverwriteType, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'unlock',
  aliases: { prefix: [], slash: [] },
  description: 'Unlocks a channel locked with the lock command.',
  usage: 'unlock [channel] [reason]',
  permissions: { client: ['ManageRoles'], user: ['ManageRoles'] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: true,
  options: [
    {
      name: 'channel',
      description: 'the channel you want to unlock',
      type: 'Channel',
      required: false
    },
    {
      name: 'reason',
      description: 'the reason for unlocking the channel',
      type: 'String',
      required: false
    }
  ],

  run: async (message, lang, { db }) => {
    const msg = await message.customReply(lang('global.loading'));

    message.args?.shift();

    const
      channel = message.options?.getChannel('channel') || message.mentions?.channels.first() || message.channel,
      reason = message.options?.getString('reason') || message.args?.join(' ') || 'no reason given',
      oldData = db.get('guildSettings'),
      overwrites = Object.entries(oldData[message.guild.id]?.lockedChannels?.[channel.id] || [])?.filter(async ([k, v]) => {
        if (channel.permissionOverwrites.cache.get(k)?.allow.has(PermissionFlagsBits.SendMessages)) return;
        if (v == OverwriteType.Role) return (await message.guild.roles.fetch(k)).comparePositionTo(message.guild.members.me.roles.highest) < 0;
        return (await message.guild.members.fetch(k)).manageable;
      });

    if (!overwrites.length) msg.edit('This channel is not locked.');

    for (const [id, type] of overwrites) {
      await channel.permissionOverwrites.edit(id,
        { [PermissionFlagsBits.SendMessages]: true },
        { type, reason: `unlock command, moderator ${message.user.tag}` }
      );
    }

    delete oldData[message.guild.id].lockedChannels[channel.id];
    db.set('guildSettings', oldData);

    const embed = new EmbedBuilder({
      title: 'Channel unlocked!',
      description:
        'This Channel has been unlocked.\n' +
        `Moderator: ${message.user.tag}\n` +
        `Reason: ${reason}`,
      color: Colors.Red
    });

    await channel.send({ embeds: [embed] });
    msg.edit('The channel has been successfully unlocked.');
  }
}