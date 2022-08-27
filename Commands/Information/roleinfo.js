const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'roleinfo',
  aliases: { prefix: ['role-info'], slash: [] },
  description: 'Get information about a role',
  usage: 'PREFIX Command: roleinfo <@role | role name | role id>',
  permissions: { client: [], user: [] },
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

  run: async (message, lang) => {
    if (message.content) {
      message.args = message.args[0]?.replace(/[<@>]/g, '');
      message.content = message.content?.replace(/[<@>]/g, '');
    }
    if (!message.options?.getRole('role') && !message.args?.[0]) message.args = [message.member.roles.highest.id];

    const role = message.options?.getRole('role') || message.mentions.roles.first() || message.guild.roles.cache.find(e => [...message.args, message.content].includes(e.id) || [...message.args, message.content].includes(e.name));

    const embed = new EmbedBuilder({
      title: role.name,
      color: role.color,
      fields: [
        { name: lang('mention'), value: role.toString(), inline: true },
        { name: lang('members'), value: role.members.size, inline: true },
        { name: lang('color'), value: role.color ? `[${role.hexColor}](https://www.color-hex.com/color/${role.displayHexColor.substring(1)})` : lang('none'), inline: true },
        { name: lang('mentionable'), value: role.mentionable, inline: true },
        { name: lang('hoist'), value: role.hoist, inline: true },
        { name: lang('managed'), value: role.managed, inline: true },
        { name: lang('position'), value: `\`${role.position}\``, inline: true },
        { name: 'ID', value: `\`${role.id}\``, inline: true },
        { name: lang('createdAt'), value: `<t:${Math.round(role.createdTimestamp / 1000)}>`, inline: true },
        role.members.size < 16 ? { name: lang('members'), value: Array.from(role.members.values()).join(', '), inline: false } : null,
        { name: lang('permissions'), value: `\`${role.permissions.has('Administrator') ? lang('admin') : role.permissions.toArray()?.join('`, `') || lang('none')}\` (\`${role.permissions.toArray().length}\`)`, inline: false }
      ].filter(e => e)
    });

    if (role.color || role.icon) embed.setThumbnail(role.icon ? `https://cdn.discordapp.com/role-icons/${role.guild.id}/${role.icon}.webp?size=80&quality=lossless` : `https://dummyimage.com/80x80/${role.color}/${role.color}.png`);

    message.customreply({ embeds: [embed] });
  }
}