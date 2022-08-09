const
  { Command } = require('reconlx'),
  { EmbedBuilder, PermissionFlagsBits, Message } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node');

module.exports = new Command({
  name: 'userinfo',
  aliases: { prefix: ['user-info'], slash: [] },
  description: 'Get information about a user',
  usage: 'PREFIX Command: roleinfo <@user | user name | user tag | user nickname | user id>',
  permissions: { client: ['EmbedLinks'], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'target',
    description: 'the user you want to get information about',
    type: 'User',
    required: false
  }],

  run: async (message, { functions }) => {
    if (message?.content) {
      message.args = message?.args[0]?.replace(/[<@&>]/g, '');
      message.content = message?.content?.replace(/[<@&>]/g, '');
    }

    const
      member = message?.options?.getMember('target') || message.guild.members.cache.find(e => [e.user.id, e.user.username, e.user.tag, e.nickname].some(e => [...message.args, message.content].includes(e))) || message.member,
      user = member.user,
      color = parseInt((await getAverageColor(member.displayAvatarURL())).hex.substring(1), 16);

    let type = user.bot ? 'Bot, ' : '';

    if (member.guild.ownerId == member.id) type += 'Guild Owner';
    else if (member.permissions.has(PermissionFlagsBits.Administrator)) type += 'Guild Administrator';
    else if (member.permissions.has(PermissionFlagsBits.ModerateMembers)) type += 'Guild Moderator';
    else type += 'Guild Member';

    const embed = new EmbedBuilder({
      title: user.tag,
      description: ' ',
      color: color,
      fields: [
        { name: 'Mention', value: user.toString(), inline: true },
        { name: 'Type', value: type, inline: true },
        { name: 'Roles', value: `\`${member.roles.cache.size}\``, inline: true },
        { name: 'Position', value: `\`${member.roles.highest.position}\`, ${member.roles.highest}`, inline: true },
        { name: 'ID', value: `\`${user.id}\``, inline: true },
        { name: 'Color', value: `[${member.displayHexColor}](https://www.color-hex.com/color/${member.displayHexColor.substring(1)})`, inline: true },
        { name: 'Moderatable', value: member.moderatable, inline: true },
        { name: 'Created At', value: `<t:${Math.round(user.createdTimestamp / 1000)}>`, inline: true },
        { name: 'Joined At', value: `<t:${Math.round(member.joinedTimestamp / 1000)}>`, inline: true },
        member.isCommunicationDisabled() ? { name: 'Timed Out Until', value: `<t:${Math.round(member.communicationDisabledUntilTimestamp / 1000)}>`, inline: true } : null,
        { name: 'Roles with permissions', value: Array.from(member.roles.cache.values()).filter(e => e.permissions.toArray().length && e.name != '@everyone').join(', '), inline: false },
        { name: 'Permissions', value: `\`${member.permissions.has('Administrator') ? 'Administrator' : member.permissions.toArray()?.join('`, `') || 'NONE'}\` (${member.permissions.toArray().length})`, inline: false }
      ].filter(e => e)
    }).setThumbnail(member.displayAvatarURL())

    message instanceof Message ? functions.reply({ embeds: [embed] }, message) : message.editReply({ embeds: [embed] });
  }
})