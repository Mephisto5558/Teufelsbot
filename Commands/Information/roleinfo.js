const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js');

module.exports = new Command({
  name: 'roleinfo',
  aliases: { prefix: ['role-info'], slash: [] },
  description: 'Get information about a role',
  usage: 'PREFIX COMMAND: roleinfo <@role | role name | role id>',
  permissions: { client: ['EMBED_LINKS'], user: [] },
  cooldowns: { guild: 0, user: 1000 },
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
    if(message) {
      message.args = message?.args?.[0].replace(/[<@>]/g, '');
      message.content = message?.content?.replace(/[<@>]/g, '');
    }

    const role = interaction?.options.getRole('role') || message.mentions.roles.first() || message.guild.roles.cache.find(e => [message.args, message.content].includes(e.id) || [message.args, message.content].includes(e.name));
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