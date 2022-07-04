const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js');

module.exports = new Command({
  name: 'roleinfo',
  aliases: ['role-info'],
  description: 'Get information about a role',
  usage: 'PREFIX COMMAND: roleinfo <@role | role name | role id>',
  permissions: { client: ['EMBED_LINKS'], user: [] },
  cooldowns: { global: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'role',
    description: 'the role you want to get information about',
    type: 'ROLE',
    required: true
  }],

  run: async (client, message, interaction) => {
    if (interaction) message = interaction;

    const role = interaction?.options.getRole('role') || message.mentions.roles.first() || message.guild.roles.cache.find(e => e.id == message.args[0] || e.name == message.args[0]);
    if (!role) return client.functions.reply('You need to provide a role (by id, name or mention)', message);

    const color = role.hexColor.slice(1);
    const embed = new MessageEmbed({
      title: role.name,
      description: ' ',
      color: color,
      fields: [
        ['Mention', role],
        ['Members', role.members.size],
        ['Color', `[${role.hexColor}](https://www.color-hex.com/color/${color})`],
        ['Mentionable', role.mentionable],
        ['Hoist', role.hoist],
        ['Managed', role.managed],
        ['Position', role.position],
        ['ID', `\`${role.id}\``],
        ['Created At', `<t:${Math.round(role.createdTimestamp / 1000)}>`]
      ].map(e => { return { name: e[0], value: e[1].toString(), inline: !(e[2] === false) } })
    })
      .setThumbnail(role.icon ? `https://cdn.discordapp.com/role-icons/${role.guild.id}/${role.icon}.webp?size=80&quality=lossless` : `https://dummyimage.com/80x80/${color}/${color}.png`);
      
    if (role.members.size < 16) embed.addField('Members', Array.from(role.members.values()).join(', '));
    embed.addField('Permissions', `\`${role.permissions.toArray()?.join('`, `') || 'NONE'}\` (${role.permissions.toArray().length})`)

    interaction ? interaction.editReply({ embeds: [embed] }) : client.functions.reply({ embeds: [embed] }, message);
  }
})