const
  { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node'),
  { getTarget, getAge, permissionTranslator } = require('../../Utils');

/**@type {command}*/
module.exports = {
  name: 'userinfo',
  aliases: { prefix: ['user-info'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'target', type: 'User' }],

  run: async function (lang) {
    this.args = this.args?.map(e => e.replace(/[<@&>]/g, '')) || [];
    this.content = this.content?.replace(/[<@&>]/g, '');

    const
      member = getTarget.call(this, { returnSelf: true }),
      birthday = this.client.db.get('userSettings', `${member.id}.birthday`),
      bannerURL = (await member.user.fetch()).bannerURL();

    let type = member.user.bot ? 'Bot, ' : '';

    if (member.guild.ownerId == member.id) type += lang('guildOwner');
    else if (member.permissions.has(PermissionFlagsBits.Administrator)) type += lang('guildAdmin');
    else if (member.permissions.has(PermissionFlagsBits.ModerateMembers)) type += lang('guildMod');
    else type += lang('guildMember');

    const
      embed = new EmbedBuilder({
        title: member.user.tag,
        color: parseInt((await getAverageColor(member.displayAvatarURL())).hex.substring(1), 16),
        thumbnail: { url: member.displayAvatarURL() },
        image: { url: bannerURL && bannerURL + '?size=1024' },
        fields: [
          { name: lang('mention'), value: member.user.toString(), inline: true },
          { name: 'ID', value: `\`${member.id}\``, inline: true },
          { name: lang('type'), value: type, inline: true },
          { name: lang('position'), value: `\`${this.guild.roles.highest.position - member.roles.highest.position + 1}\`, ${member.roles.highest}`, inline: true },
          { name: lang('roles'), value: `\`${member.roles.cache.size}\``, inline: true },
          { name: lang('color'), value: `[${member.displayHexColor}](https://www.color-hex.com/color/${member.displayHexColor.substring(1)})`, inline: true },
          { name: lang('createdAt'), value: `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, inline: true },
          { name: lang('joinedAt'), value: `<t:${Math.round(member.joinedTimestamp / 1000)}>`, inline: true },
          { name: lang('rolesWithPerms'), value: Array.from(member.roles.cache.values()).filter(e => e.permissions.toArray().length && e.name != '@everyone').join(', '), inline: false },
          { name: lang('perms'), value: `\`${member.permissions.has(PermissionFlagsBits.Administrator) ? lang('admin') : permissionTranslator(member.permissions.toArray(), lang.__boundArgs__[0].locale, this.client.i18n)?.join('`, `') || lang('global.none')}\` (${member.permissions.toArray().length})`, inline: false }
        ]
      }),
      components = [new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: lang('downloadAvatar'),
            style: ButtonStyle.Link,
            url: member.displayAvatarURL({ size: 2048 })
          })
        ]
      })];

    if (birthday) embed.data.fields.splice(-2, 0, { name: lang('birthday'), value: `<t:${Math.round(new Date(birthday).getTime() / 1000)}:D> (${getAge(birthday.split('/'))})`, inline: true });
    if (member.isCommunicationDisabled()) embed.data.fields.splice(-2, 0, { name: lang('timedOutUntil'), value: `<t:${Math.round(member.communicationDisabledUntilTimestamp / 1000)}>`, inline: true });
    if (member.user.flags.bitfield) embed.data.fields.splice(-2, 0, { name: lang('flags.name'), value: member.user.flags.toArray().reduce((acc, e) => Number(e) ? acc : acc + lang('flags.' + e) + '`, `', '`').slice(0, -3), inline: false });

    if (bannerURL) components[0].components.push(new ButtonBuilder({
      label: lang('downloadBanner'),
      style: ButtonStyle.Link,
      url: bannerURL + '?size=2048'
    }));

    if (member.bannable && (this.member.roles.highest.position > member.roles.highest.position || this.user.id == this.guild.ownerId)) {
      const comp = new ActionRowBuilder();

      if (this.member.permissions.has(PermissionFlagsBits.KickMembers)) comp.components.push(new ButtonBuilder({
        label: lang('kickMember'),
        customId: `infoCMDs.${member.id}.kick.members`,
        style: ButtonStyle.Danger,
      }));

      if (this.member.permissions.has(PermissionFlagsBits.BanMembers)) comp.components.push(new ButtonBuilder({
        label: lang('banMember'),
        customId: `infoCMDs.${member.id}.ban.members`,
        style: ButtonStyle.Danger,
      }));

      if (comp.components.length) components.push(comp);
    }

    return this.customReply({ embeds: [embed], components });
  }
};