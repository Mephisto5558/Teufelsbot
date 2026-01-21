const
  {
    ActionRowBuilder, ButtonBuilder, ButtonStyle, CDNRoutes, EmbedBuilder,
    ImageFormat, PermissionFlagsBits, RouteBases, hyperlink, inlineCode
  } = require('discord.js'),
  { Command, commandTypes, permissionTranslator } = require('@mephisto5558/command'),
  { getTargetRole, timeFormatter: { msInSecond, timestamp } } = require('#Utils'),

  ROLE_DISPLAY_THRESHOLD = 16;

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  aliases: { [commandTypes.prefix]: ['role-info'] },
  cooldowns: { user: msInSecond },
  options: [{ name: 'role', type: 'Role' }],

  async run(lang) {
    const
      role = getTargetRole(this, { targetOptionName: 'role', returnSelf: true }),
      embed = new EmbedBuilder({
        title: role.name,
        color: role.colors.primaryColor,
        fields: [
          { name: lang('mention'), value: role.toString(), inline: true },
          { name: lang('members'), value: role.members.size, inline: true },
          { name: lang('color'), value: hyperlink(role.hexColor, `https://www.color-hex.com/color/${role.hexColor.slice(1)}`), inline: true },
          { name: lang('mentionable'), value: lang(`global.${role.mentionable}`), inline: true },
          { name: lang('hoist'), value: lang(`global.${role.hoist}`), inline: true },
          { name: lang('managed'), value: lang(`global.${role.managed}`), inline: true },
          { name: lang('position'), value: inlineCode(this.guild.roles.highest.position - role.position + 1), inline: true },
          { name: 'ID', value: inlineCode(role.id), inline: true },
          { name: lang('createdAt'), value: timestamp(role.createdTimestamp), inline: true }
        ]
      });

    if (role.members.size.inRange(0, ROLE_DISPLAY_THRESHOLD))
      embed.data.fields.push({ name: lang('members'), value: [...role.members.values()].join(', '), inline: false });

    embed.data.fields.push({ name: lang('permissions'), inline: false });
    if (role.permissions.has(PermissionFlagsBits.Administrator))
      embed.data.fields.at(-1).value = `${inlineCode(lang('admin'))} (${inlineCode(role.permissions.toArray().length)})`;
    else {
      const
        perms = permissionTranslator(role.permissions.toArray(), lang.config.locale, this.client.i18n).map(inlineCode).join(', '),
        maxLength = 1017,
        suffix = '...';

      embed.data.fields.at(-1).value
        = (perms.length < maxLength ? perms : perms.slice(0, perms.slice(0, maxLength - suffix.length).lastIndexOf(',')) + suffix)
          || lang('global.none')
          + ` (${inlineCode(role.permissions.toArray().length)})`;
    }


    if (role.icon)
      embed.data.thumbnail = { url: RouteBases.cdn + CDNRoutes.roleIcon(role.id, role.icon, ImageFormat.WebP) + '?size=80&quality=lossless' };
    else if (role.colors.primaryColor)
      embed.data.thumbnail = { url: `https://dummyimage.com/80x80/${role.hexColor.slice(1)}/${role.hexColor.slice(1)}.png` };

    const components = this.member.permissions.has(PermissionFlagsBits.ManageRoles) && role.editable
      && (this.member.roles.highest.position > role.position || this.user.id == this.guild.ownerId)
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
});