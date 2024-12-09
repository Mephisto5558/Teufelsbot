const
  { EmbedBuilder } = require('discord.js'),
  { DiscordAPIErrorCodes } = require('#Utils');

/**
 * @this {StringConstructor | string | undefined}
 * @param {import('discord.js').GuildMember}member
 * @param {number}year */
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

    await this.guilds.fetch();
    for (const [, guild] of this.guilds.cache) {
      const settings = guild.db.birthday;
      if (!settings?.enable) continue;

      /** @type {Record<Snowflake, number>} */
      const birthdayUserList = Object.entries(this.db.get('userSettings')).reduce((acc, [id, e]) => {
        if (e.birthday?.getMonth() == nowMonth && e.birthday.getDate() == nowDate) acc[id] = e.birthday.getFullYear();
        return acc;
      }, {});

      if (!birthdayUserList.__count__) continue;

      for (const [,member] of await guild.members.fetch({ user: Object.keys(birthdayUserList) })) {
        const year = birthdayUserList[member.id];

        let channel;
        if (settings.ch?.channel) {
          try { channel = await guild.channels.fetch(settings.ch.channel); }
          catch (err) {
            if (err.code != DiscordAPIErrorCodes.UnknownChannel) throw err;
            return (await guild.fetchOwner()).send(this.i18n.__({ locale: guild.db.config.lang ?? guild.localeCode }, 'others.timeEvents.birthday.unknownChannel', guild.name));
          }

          const embed = new EmbedBuilder({
            title: formatBirthday.call(settings.ch.msg?.embed?.title ?? defaultSettings.ch.msg.embed.title, member, year),
            description: formatBirthday.call(settings.ch.msg?.embed?.description ?? defaultSettings.ch.msg.embed.description, member, year),
            color: settings.ch.msg?.embed?.color ?? defaultSettings.ch.msg.embed.color
          });

          await channel.send({ content: formatBirthday.call(settings.ch.msg?.content, member, year), embeds: [embed] });
        }

        if (settings.dm?.enable) {
          const embed = new EmbedBuilder({
            title: formatBirthday.call(settings.dm.msg?.embed?.title ?? defaultSettings.dm.msg.embed.title, member, year),
            description: formatBirthday.call(settings.dm.msg?.embed?.description ?? defaultSettings.dm.msg.embed.description, member, year),
            color: settings.dm.msg?.embed?.color ?? defaultSettings.dm.msg.embed.color
          });

          try { await member.send({ content: formatBirthday.call(settings.dm.msg?.content, member, year), embeds: [embed] }); }
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