const { PermissionFlagsBits, OverwriteType, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'lock',
  aliases: { prefix: [], slash: [] },
  description: 'Prevents everyone except administrators from writing in a channel',
  usage: 'lock [channel] [reason]',
  permissions: { client: ['ManageRoles'], user: ['ManageRoles'] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: true, beta: true,
  options: [
    {
      name: 'channel',
      description: 'the channel you want to lock',
      type: 'Channel',
      required: false
    },
    {
      name: 'reason',
      description: 'the reason for locking the channel',
      type: 'String',
      required: false
    }
  ],

  run: async (message, lang, { db }) => {
    const msg = await message.customreply(lang('global.loading'));

    message.args?.shift();

    const
      channel = message.options?.getChannel('channel') || message.mentions?.channels.first() || message.channel,
      reason = message.options?.getString('reason') || message.args?.join(' ') || 'no reason given',
      overwrites = Object.assign({}, ...channel.permissionOverwrites.cache.filter(async e => {
        if (!e.allow.has(PermissionFlagsBits.SendMessages) || e.allow.has(PermissionFlagsBits.Administrator)) return;
        if (e.type == OverwriteType.Role) return (await message.guild.roles.fetch(e.id)).comparePositionTo(message.guild.members.me.roles.highest) < 0;
        return (await message.guild.members.fetch(e.id)).manageable;
      }).map(e => ({ [e.id]: e.type })));

    if (channel.permissionOverwrites.resolve(message.guild.roles.everyone.id)?.allow.has(PermissionFlagsBits.SendMessages))
      overwrites[message.guild.roles.everyone.id] = OverwriteType.Role;

    db.set('guildSettings', db.get('guildSettings').fMerge({ [message.guild.id]: { lockedChannels: { [channel.id]: overwrites } } }));


    for (const [id, type] of Object.entries(overwrites)) {
      await channel.permissionOverwrites.edit(id,
        { [PermissionFlagsBits.SendMessages]: false },
        { type, reason: `lock command, moderator ${message.user.tag}` }
      )
    }

    const embed = new EmbedBuilder({
      title: 'Channel locked!',
      description:
        'This Channel has been locked.\n' +
        `Moderator: ${message.user.tag}\n` +
        `Reason: ${reason}`,
      color: Colors.Red
    });

    await channel.send({ embeds: [embed] });
    msg.edit('The channel has been successfully locked.');
  }
}