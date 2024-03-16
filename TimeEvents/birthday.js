const
  { EmbedBuilder } = require('discord.js'),
  { DiscordAPIErrorCodes } = require('../Utils');

/**
 * @this {StringConstructor}
 * @param {import('discord.js').User}user
 * @param {number}year*/
function formatBirthday(user, year) {
  return this?.toString()?.replaceAll('<user.nickname>', user.displayName)
    .replaceAll('<user.username>', user.username)
    .replaceAll('<user.id>', user.id)
    .replaceAll('<user.tag>', user.tag)
    .replaceAll('<user.joinedAt>', user.joinedAt.toLocaleDateString('en'))
    .replaceAll('<guild.id>', user.guild.id)
    .replaceAll('<guild.memberCount>', user.guild?.memberCount)
    .replaceAll('<guild.name>', user.guild?.name)
    .replaceAll('<bornyear>', year)
    .replaceAll('<date>', new Date().toLocaleDateString('en'))
    .replaceAll('<age>', Number.parseInt(year) ? new Date().getFullYear() - year : '<age>')
    .replaceAll(/<age>\.?/g, ''); // <guilds> gets replaced below
}

module.exports = {
  time: '00 00 00 * * *', // daily
  startNow: true,

  /** @this {Client}*/
  onTick: async function () {
    const now = new Date().toLocaleString('en', { month: '2-digit', day: '2-digit' });

    if (this.settings.lastBirthdayCheck == now) return void log('Already ran birthday check today');
    log('Started birthday check');

    const
      guildList = (await this.guilds.fetch()).map(e => e.fetch()),
      defaultSettings = this.defaultSettings.birthday;

    for await (const guild of guildList) {
      const settings = guild.db.birthday;
      if (!settings?.enable) continue;

      const userList = Object.entries(this.db.get('userSettings')).reduce((acc, [k, { birthday } = {}]) => {
        const time = birthday?.slice(5);
        if (time == now) acc.push([k, time]);
        return acc;
      }, []);

      for (const entry of userList) {
        let channel, user;

        try { user = await guild.members.fetch(entry[0]); }
        catch (err) {
          if (err.code != DiscordAPIErrorCodes.UnknownMember) throw err;
          continue;
        }

        if (settings.ch?.channel) {
          try { channel = await guild.channels.fetch(settings.ch.channel); }
          catch (err) {
            if (err.code != DiscordAPIErrorCodes.UnknownChannel) throw err;
            return (await guild.fetchOwner()).send(this.i18n.__({ locale: guild?.db.config?.lang ?? guild?.localeCode }, 'others.timeEvents.birthday.unknownChannel', guild.name));
          }

          const embed = new EmbedBuilder({
            title: formatBirthday.call(settings.ch.msg?.embed?.title ?? defaultSettings.ch.msg.embed.title, user, entry[2]),
            description: formatBirthday.call(settings.ch.msg?.embed?.description ?? defaultSettings.ch.msg.embed.description, user, entry[2]),
            color: settings.ch.msg?.embed?.color ?? defaultSettings.ch.msg.embed.color
          });

          await channel.send({ content: formatBirthday.call(settings.ch.msg?.content, user, entry[2]), embeds: [embed] });
        }

        if (settings.dm?.enable) {
          const embed = new EmbedBuilder({
            title: formatBirthday.call(settings.dm.msg?.embed?.title ?? defaultSettings.dm.msg.embed.title, user, entry[2]),
            description: formatBirthday.call(settings.dm.msg?.embed?.description ?? defaultSettings.dm.msg.embed.description, user, entry[2]),
            color: settings.dm.msg?.embed?.color ?? defaultSettings.dm.msg.embed.color
          });

          try { await user.send({ content: formatBirthday.call(settings.dm.msg?.content, user, entry[2]), embeds: [embed] }); }
          catch (err) {
            if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;
          }
        }
      }
    }

    await this.db.update('botSettings', 'lastBirthdayCheck', now);
    log('Finished birthday check');
  }
};