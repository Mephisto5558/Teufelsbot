const
  { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { permissionTranslator, getTargetRole, timeFormatter: { msInSecond } } = require('#Utils'),
  ROLE_DISPLAY_THRESHOLD = 16;

/** @type {command<'both'>}*/
module.exports = {
  aliases: { prefix: ['role-info'] },
  cooldowns: { user: msInSecond },
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'role', type: 'Role' }],

  async run(lang) {
    this.args = this.args?.map(e => e.replaceAll(/[<>@]/g, '')) ?? [];
    this.content = this.content?.replaceAll(/[<>@]/g, '');

    const role = getTargetRole(this, { targetOptionName: 'role', returnSelf: true });
    const embed = new EmbedBuilder({
      title: role.name,
      color: role.color,
      fields: [
        { name: lang('mention'), value: role.toString(), inline: true },
        { name: lang('members'), value: role.members.size, inline: true },
        { name: lang('color'), value: `[${role.hexColor}](https://www.color-hex.com/color/${role.hexColor.slice(1)})`, inline: true },
        { name: lang('mentionable'), value: lang(`global.${role.mentionable}`), inline: true },
        { name: lang('hoist'), value: lang(`global.${role.hoist}`), inline: true },
        { name: lang('managed'), value: lang(`global.${role.managed}`), inline: true },
        { name: lang('position'), value: `\`${this.guild.roles.highest.position - role.position + 1}\``, inline: true },
        { name: 'ID', value: `\`${role.id}\``, inline: true },
        { name: lang('createdAt'), value: `<t:${Math.round(role.createdTimestamp / msInSecond)}>`, inline: true }
      ]
    });

    if (role.members.size.inRange(0, ROLE_DISPLAY_THRESHOLD)) embed.data.fields.push({ name: lang('members'), value: [...role.members.values()].join(', '), inline: false });

    if (role.permissions.has(PermissionFlagsBits.Administrator)) embed.data.fields.at(-1).value = `\`${lang('admin')}\` (\`${role.permissions.toArray().length}\`)`;
    else {
      const
        perms = permissionTranslator(role.permissions.toArray(), lang.__boundArgs__[0].locale, this.client.i18n).join('`, `'),
        maxLength = 1017,
        suffix = '...';

      embed.data.fields.at(-1).value = '`'
      + (perms.length < maxLength ? `${perms}\`` : perms.slice(0, perms.slice(0, maxLength - suffix.length).lastIndexOf(',')) + suffix)
      + `(\`${role.permissions.toArray().length}\`)`;
    }


    if (role.icon) embed.data.thumbnail = { url: `https://cdn.discordapp.com/role-icons/${role.guild.id}/${role.icon}.webp?size=80&quality=lossless` };
    else if (role.color) embed.data.thumbnail = { url: `https://dummyimage.com/80x80/${role.hexColor.slice(1)}/${role.hexColor.slice(1)}.png` };

    const components = this.member.permissions.has(PermissionFlagsBits.ManageRoles) && role.editable && (this.member.roles.highest.position > role.position || this.user.id == this.guild.ownerId)
      ? [new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('delete'),
          customId: `infoCMDs.${role.id}.delete.roles`,
          style: ButtonStyle.Danger
        })]
      })]
      : [];

    return this.customReply({ embeds: [embed], components });
  }
};