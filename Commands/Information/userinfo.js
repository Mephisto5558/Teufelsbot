const
  { PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node'),
  permissionTranslate = require('../../Utils/permissionTranslate.js'),
  getAge = require('../../Utils/getAge.js');

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
      member = this.options?.getMember('target') || this.mentions?.members.first() || this.guild.members.cache.find(e => [e.user.id, e.user.username, e.user.tag, e.nickname].some(e => [...this.args, this.content].includes(e))) || this.member,
      birthday = this.client.db.get('userSettings')[member.id]?.birthday,
      bannerURL = (await member.user.fetch()).bannerURL();

    let type = member.user.bot ? 'Bot, ' : '';

    if (member.guild.ownerId == member.id) type += lang('guildOwner');
    else if (member.permissions.has(PermissionFlagsBits.Administrator)) type += lang('guildAdmin');
    else if (member.permissions.has(PermissionFlagsBits.ModerateMembers)) type += lang('guildMod');
    else type += lang('guildMember');

    const embed = new EmbedBuilder({
      title: member.user.tag,
      color: parseInt((await getAverageColor(member.displayAvatarURL())).hex.substring(1), 16),
      thumbnail: { url: member.displayAvatarURL() },
      image: { url: bannerURL && bannerURL + '?size=1024' },
      fields: [
        { name: lang('mention'), value: member.user.toString(), inline: true },
        { name: 'ID', value: `\`${member.id}\``, inline: true },
        { name: lang('type'), value: type, inline: true },
        { name: lang('position'), value: `\`${member.roles.highest.position}\`, ${member.roles.highest}`, inline: true },
        { name: lang('roles'), value: `\`${member.roles.cache.size}\``, inline: true },
        { name: lang('color'), value: `[${member.displayHexColor}](https://www.color-hex.com/color/${member.displayHexColor.substring(1)})`, inline: true },
        { name: lang('createdAt'), value: `<t:${Math.round(member.user.createdTimestamp / 1000)}>`, inline: true },
        { name: lang('joinedAt'), value: `<t:${Math.round(member.joinedTimestamp / 1000)}>`, inline: true },
        birthday && { name: lang('birthday'), value: `<t:${Math.round(new Date(birthday).getTime() / 1000)}:D> (${getAge(birthday.split('/'))})`, inline: true },
        member.isCommunicationDisabled() && { name: lang('timedOutUntil'), value: `<t:${Math.round(member.communicationDisabledUntilTimestamp / 1000)}>`, inline: true },
        { name: 'Roles with permissions', value: Array.from(member.roles.cache.values()).filter(e => e.permissions.toArray().length && e.name != '@everyone').join(', '), inline: false },
        { name: 'Permissions', value: `\`${member.permissions.has(PermissionFlagsBits.Administrator) ? lang('admin') : permissionTranslate(member.permissions.toArray(), lang.__boundArgs__[0].locale)?.join('`, `') || lang('global.none')}\` (${member.permissions.toArray().length})`, inline: false }
      ].filter(Boolean)
    });

    const component = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          label: lang('downloadAvatar'),
          style: ButtonStyle.Link,
          url: member.displayAvatarURL({ size: 2048 })
        })
      ]
    });

    if (bannerURL) component.components.push(new ButtonBuilder({
      label: lang('downloadBanner'),
      style: ButtonStyle.Link,
      url: bannerURL + '?size=2048'
    }));

    this.customReply({ embeds: [embed], components: [component] });
  }
};