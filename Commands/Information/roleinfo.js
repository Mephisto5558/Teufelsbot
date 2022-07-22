const
  { Command } = require('reconlx'),
  { EmbedBuilder } = require('discord.js');

module.exports = new Command({
  name: 'roleinfo',
  aliases: { prefix: ['role-info'], slash: [] },
  description: 'Get information about a role',
  usage: 'PREFIX Command: roleinfo <@role | role name | role id>',
  permissions: { client: ['EmbedLinks'], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'role',
    description: 'the role you want to get information about',
    type: 'Role',
    required: false
  }],

  run: async ({ functions }, message, interaction) => {
    if (interaction) message = interaction;
    if (message?.content) {
      message.args = message?.args[0]?.replace(/[<@>]/g, '');
      message.content = message?.content?.replace(/[<@>]/g, '');
    }
    if (!interaction?.options.getRole('role') || (!interaction && !message.args[0])) message.args = [message?.member.roles.highest.id];

    const role = interaction?.options.getRole('role') || message.mentions.roles.first() || message.guild.roles.cache.find(e => [...message.args, message.content].includes(e.id) || [...message.args, message.content].includes(e.name));

    const embed = new EmbedBuilder({
      title: role.name,
      color: role.color,
      fields: [
        { name: 'Mention', value: role.toString(), inline: true },
        { name: 'Members', value: role.members.size, inline: true },
        { name: 'Color', value: role.color ? `[${role.hexColor}](https://www.color-hex.com/color/${role.displayHexColor.substring(1)})` : 'none', inline: true },
        { name: 'Mentionable', value: role.mentionable, inline: true },
        { name: 'Hoist', value: role.hoist, inline: true },
        { name: 'Managed', value: role.managed, inline: true },
        { name: 'Position', value: `\`${role.position}\``, inline: true },
        { name: 'ID', value: `\`${role.id}\``, inline: true },
        { name: 'Created At', value: `<t:${Math.round(role.createdTimestamp / 1000)}>`, inline: true },
        role.members.size < 16 ? { name: 'Members', value: Array.from(role.members.values()).join(', '), inline: false } : null,
        { name: 'Permissions', value: `\`${role.permissions.has('Administrator') ? 'Administrator' : role.permissions.toArray()?.join('`, `') || 'none'}\` (\`${role.permissions.toArray().length}\`)`, inline: false }
      ].filter(e => e)
    });

    if (role.color || role.icon) embed.setThumbnail(role.icon ? `https://cdn.discordapp.com/role-icons/${role.guild.id}/${role.icon}.webp?size=80&quality=lossless` : `https://dummyimage.com/80x80/${role.color}/${role.color}.png`);

    interaction ? interaction.editReply({ embeds: [embed] }) : functions.reply({ embeds: [embed] }, message);
  }
})