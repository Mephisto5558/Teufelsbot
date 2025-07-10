const
  { EmbedBuilder, inlineCode } = require('discord.js'),
  { DiscordAPIErrorCodes } = require('#Utils');

/**
 * @this {StringConstructor | string | undefined}
 * @param {import('discord.js').GuildMember} member
 * @param {number} year */
function formatBirthday(member, year) {
  return this?.toString().replaceAll('{user.nickname}', member.displayName)
    .replaceAll('{user.username}', member.user.username)
    .replaceAll('{user.id}', member.id)
    .replaceAll('{user.tag}', member.user.tag)
    .replaceAll('{user.createdAt}', member.user.createdAt.toLocaleDateString('en'))
    .replaceAll('{user.joinedAt}', member.joinedAt.toLocaleDateString('en'))
    .replaceAll('{guild.id}', member.guild.id)
    .replaceAll('{guild.memberCount}', member.guild.memberCount)
    .replaceAll('{guild.name}', member.guild.name)
    .replaceAll('{bornyear}', year)
    .replaceAll('{date}', new Date().toLocaleDateString('en'))
    .replaceAll('{age}', Number.parseInt(year) ? new Date().getFullYear() - year : '{age}')
    .replaceAll(/\{age\}\.?/g, ''); // {guilds} gets replaced below
}

module.exports = {
  time: '00 00 00 * * *',
  startNow: true,

  /** @this {Client} */
  async onTick() {
    const
      now = new Date(),
      nowMonth = now.getMonth(),
      nowDate = now.getDate();

    if (this.settings.timeEvents.lastBirthdayCheck?.toDateString() == now.toDateString()) return void log('Already ran birthday check today');
    log('Started birthday check');

    const defaultSettings = this.defaultSettings.birthday;

    /**
     * @param {'ch' | 'dm'} type
     * @param {NonNullable<NonNullable<import('../types/database').Database['guildSettings'][Snowflake]>['birthday']>} settings
     * @param {import('discord.js').GuildMember} member
     * @param {number} year */
    function createEmbed(type, settings, member, year) {
      return new EmbedBuilder({
        title: formatBirthday.call(settings[type].msg?.embed?.title ?? defaultSettings[type].msg.embed.title, member, year),
        description: formatBirthday.call(settings[type].msg?.embed?.description ?? defaultSettings[type].msg.embed.description, member, year),
        color: settings[type].msg?.embed?.color ?? defaultSettings[type].msg.embed.color
      });
    }

    await this.guilds.fetch();
    for (const [, guild] of this.guilds.cache) {
      const settings = guild.db.birthday;
      if (!settings?.enable || !settings.ch?.channel && !settings.dm?.enable) continue;

      /** @type {Record<Snowflake, number>} */
      const birthdayUserList = Object.entries(this.db.get('userSettings')).reduce((acc, [id, e]) => {
        if (e.birthday?.getMonth() == nowMonth && e.birthday.getDate() == nowDate) acc[id] = e.birthday.getFullYear();
        return acc;
      }, {});

      if (!birthdayUserList.__count__) continue;

      let channel;
      if (settings.ch?.channel) {
        try { channel = await guild.channels.fetch(settings.ch.channel); }
        catch (err) {
          if (err.code != DiscordAPIErrorCodes.UnknownChannel) throw err;

          const owner = await guild.fetchOwner();
          return owner.send(this.i18n.__({ locale: owner.user.localeCode ?? guild.localeCode }, 'others.timeEvents.birthday.unknownChannel', inlineCode(guild.name)))
            .catch(() => {
              if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;
            });
        }
      }

      for (const [,member] of await guild.members.fetch({ user: Object.keys(birthdayUserList) })) {
        const year = birthdayUserList[member.id];

        if (channel)
          await channel.send({ content: formatBirthday.call(settings.ch.msg?.content, member, year), embeds: [createEmbed('ch', settings, member, year)] });

        if (settings.dm?.enable) {
          try { await member.send({ content: formatBirthday.call(settings.dm.msg?.content, member, year), embeds: [createEmbed('dm', settings, member, year)] }); }
          catch (err) {
            if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;
          }
        }
      }
    }

    await this.db.update('botSettings', 'timeEvents.lastBirthdayCheck', now);
    log('Finished birthday check');
  }
};