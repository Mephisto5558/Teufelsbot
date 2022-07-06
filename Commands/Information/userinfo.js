const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js');

module.exports = new Command({
  name: 'userinfo',
  aliases: { prefix: ['user-info'], slash: [] },
  description: 'Get information about a user',
  usage: 'PREFIX COMMAND: roleinfo <@user | user name | user tag | user nickname | user id>',
  permissions: { client: ['EMBED_LINKS'], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'target',
    description: 'the user you want to get information about',
    type: 'USER',
    required: false
  }],

  run: async (client, message, interaction) => {
    if (interaction) message = interaction;
    if(message) {
      message.args = message.args?.[0].replace(/[<@&>]/g, ''),
      message.content = message.content?.replace(/[<@&>]/g, '')
    }
    const
      member = interaction?.options.getUser('target') || interaction?.member || message.guild.members.cache.find(e => [e.user.id, e.user.username, e.user.tag, e.nickname].some(e => [message.args, message.content].includes(e))) || message.member,
      user = member.user,
      color = member.displayHexColor.slice(1);

    let type = user.bot ? 'Bot, ' : '';

    if (member.guild.ownerId == member.id) type += 'Guild Owner';
    else if (member.permissions.has('ADMINISTRATOR')) type += 'Guild Administrator';
    else if (member.permissions.has('MODERATE_MEMBERS')) type += 'Guild Moderator';
    else type += 'Guild Member';

    const embed = new MessageEmbed({
      title: user.tag,
      description: ' ',
      color: color,
      fields: [
        ['Mention', user],
        ['Type', type],
        ['Roles', member.roles.cache.size],
        ['Position', `${member.roles.highest.position}, ${member.roles.highest}`],
        ['ID', `\`${user.id}\``],
        ['Color', `[${member.displayHexColor}](https://www.color-hex.com/color/${color})`],
        ['Moderatable', member.moderatable],
        ['Created At', `<t:${Math.round(user.createdTimestamp / 1000)}>`],
        ['Joined At', `<t:${Math.round(member.joinedTimestamp / 1000)}>`]
      ].map(e => { return { name: e[0], value: e[1].toString(), inline: !(e[2] === false) } })
    })
      .setThumbnail(member.displayAvatarURL({ dynamic: true }))

    if (member.isCommunicationDisabled()) embed.addField('Timed Out Until', `<t:${Math.round(member.communicationDisabledUntilTimestamp / 1000)}>`, true);
    embed.addField('Roles with permissions', Array.from(member.roles.cache.values()).filter(e => e.permissions.toArray().length && e.name != '@everyone').join(', '));
    embed.addField('Permissions', `\`${member.permissions.toArray()?.join('`, `') || 'NONE'}\` (${member.permissions.toArray().length})`)

    interaction ? interaction.editReply({ embeds: [embed] }) : client.functions.reply({ embeds: [embed] }, message);
  }
})