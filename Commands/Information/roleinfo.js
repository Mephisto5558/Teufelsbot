const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'roleinfo',
  aliases: { prefix: ['role-info'], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'role', type: 'Role' }],

  run: function (lang) {
    this.args = this.args?.map(e => e.replace(/[<@>]/g, '')) || [];
    this.content = this.content?.replace(/[<@>]/g, '');

    if (!this.options?.getRole('role') && !this.args?.[0]) this.args = [this.member.roles.highest.id];

    const role = this.options?.getRole('role') || this.mentions?.roles.first() || this.guild.roles.cache.find(e => [...this.args, this.content].includes(e.id) || [...this.args, this.content].includes(e.name));

    const embed = new EmbedBuilder({
      title: role.name,
      color: role.color,
      fields: [
        { name: lang('mention'), value: role.toString(), inline: true },
        { name: lang('members'), value: role.members.size, inline: true },
        { name: lang('color'), value: role.color ? `[${role.hexColor}](https://www.color-hex.com/color/${role.displayHexColor.substring(1)})` : lang('global.none'), inline: true },
        { name: lang('mentionable'), value: role.mentionable, inline: true },
        { name: lang('hoist'), value: role.hoist, inline: true },
        { name: lang('managed'), value: role.managed, inline: true },
        { name: lang('position'), value: `\`${role.position}\``, inline: true },
        { name: 'ID', value: `\`${role.id}\``, inline: true },
        { name: lang('createdAt'), value: `<t:${Math.round(role.createdTimestamp / 1000)}>`, inline: true },
        role.members.size < 16 ? { name: lang('members'), value: Array.from(role.members.values()).join(', '), inline: false } : null,
        { name: lang('permissions'), value: `\`${role.permissions.has(PermissionFlagsBits.Administrator) ? lang('admin') : role.permissions.toArray()?.join('`, `') || lang('global.none')}\` (\`${role.permissions.toArray().length}\`)`, inline: false }
      ].filter(Boolean)
    });

    if (role.color || role.icon) embed.setThumbnail(role.icon ? `https://cdn.discordapp.com/role-icons/${role.guild.id}/${role.icon}.webp?size=80&quality=lossless` : `https://dummyimage.com/80x80/${role.color}/${role.color}.png`);

    this.customReply({ embeds: [embed] });
  }
}