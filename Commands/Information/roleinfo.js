const
  { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { permissionTranslator } = require('../../Utils');

/**@type {command}*/
module.exports = {
  name: 'roleinfo',
  aliases: { prefix: ['role-info'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'role', type: 'Role' }],

  /**@this GuildInteraction|GuildMessage*/
  run: function (lang) {
    this.args = this.args?.map(e => e.replace(/[<@>]/g, '')) || [];
    this.content = this.content?.replace(/[<@>]/g, '');

    const role = this.options?.getRole('role') || (this.args?.[0] ? this.mentions?.roles.first() : this.member.roles.highest) || this.guild.roles.cache.find(e => [...this.args, this.content].includes(e.id) || [...this.args, this.content].includes(e.name));
    if (!role) return this.customReply(lang('notFound'));

    const embed = new EmbedBuilder({
      title: role.name,
      color: role.color,
      fields: [
        { name: lang('mention'), value: role.toString(), inline: true },
        { name: lang('members'), value: role.members.size, inline: true },
        { name: lang('color'), value: role.color ? `[${role.hexColor}](https://www.color-hex.com/color/${role.hexColor.substring(1)})` : lang('global.none'), inline: true },
        { name: lang('mentionable'), value: lang(`global.${role.mentionable}`), inline: true },
        { name: lang('hoist'), value: lang(`global.${role.hoist}`), inline: true },
        { name: lang('managed'), value: lang(`global.${role.managed}`), inline: true },
        { name: lang('position'), value: `\`${this.guild.roles.highest.position - role.position + 1}\``, inline: true },
        { name: 'ID', value: `\`${role.id}\``, inline: true },
        { name: lang('createdAt'), value: `<t:${Math.round(role.createdTimestamp / 1000)}>`, inline: true },
        { name: lang('permissions'), inline: true }
      ]
    });

    if (role.permissions.has(PermissionFlagsBits.Administrator)) embed.data.fields[embed.data.fields.length - 1].value = `\`${lang('admin')}\` (\`${role.permissions.toArray().length}\`)`;
    else {
      const perms = permissionTranslator(role.permissions.toArray(), lang.__boundArgs__[0].locale, this.client.i18n)?.join('`, `') || lang('global.none');
      embed.data.fields[embed.data.fields.length - 1].value = `\`${perms.length < 1017 ? perms + '`' : perms.slice(0, perms.slice(0, 1013).lastIndexOf(',')) + '...'} (\`${role.permissions.toArray().length}\`)`;
    }

    if (role.members.size && role.members.size < 16) embed.data.fields.splice(9, 0, { name: lang('members'), value: Array.from(role.members.values()).join(', '), inline: false });

    if (role.icon) embed.data.thumbnail = { url: `https://cdn.discordapp.com/role-icons/${role.guild.id}/${role.icon}.webp?size=80&quality=lossless` };
    else if (role.color) embed.data.thumbnail = { url: `https://dummyimage.com/80x80/${role.hexColor.substring(1)}/${role.hexColor.substring(1)}.png` };

    const components = this.member.permissions.has(PermissionFlagsBits.ManageRoles) && role.editable && (this.member.roles.highest.position > role.position || this.user.id == this.guild.ownerId) ? [new ActionRowBuilder({
      components: [new ButtonBuilder({
        label: lang('delete'),
        customId: `infoCMDs.${role.id}.delete.roles`,
        style: ButtonStyle.Danger
      })]
    })] : [];

    return this.customReply({ embeds: [embed], components });
  }
};
