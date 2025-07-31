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

/**
 * @param {'ch' | 'dm'} type
 * @param {NonNullable<Database['guildSettings'][Snowflake]['birthday']>} settings
 * @param {import('discord.js').GuildMember} member
 * @param {number} year
 * @param {Database['botSettings']['defaultGuild']['birthday']} defaultSettings */
function createEmbed(type, settings, member, year, defaultSettings) {
  return new EmbedBuilder({
    title: formatBirthday.call(settings[type].msg?.embed?.title ?? defaultSettings[type].msg.embed.title, member, year),
    description: formatBirthday.call(settings[type].msg?.embed?.description ?? defaultSettings[type].msg.embed.description, member, year),
    color: settings[type].msg?.embed?.color ?? defaultSettings[type].msg.embed.color
  });
}

/**
 * @this {Client}
 * @param {NonNullable<Database['guildSettings'][Snowflake]['birthday']>} settings
 * @param {import('discord.js').Guild} guild */
async function getChannel(settings, guild) {
  if (!settings.ch?.channel) return;

  try { return await guild.channels.fetch(settings.ch.channel); }
  catch (err) {
    if (err.code != DiscordAPIErrorCodes.UnknownChannel) throw err;

    const owner = await guild.fetchOwner();
    void owner.send(this.i18n.__({ locale: owner.localeCode }, 'others.timeEvents.birthday.unknownChannel', inlineCode(guild.name))).catch(() => {
      if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;
    });
  }
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

      const channel = await getChannel.call(this, settings, guild);
      for (const [,member] of await guild.members.fetch({ user: Object.keys(birthdayUserList) })) {
        const year = birthdayUserList[member.id];

        if (channel) {
          await channel.send({
            content: formatBirthday.call(settings.ch.msg?.content, member, year),
            embeds: [createEmbed('ch', settings, member, year, this.defaultSettings.birthday)]
          });
        }

        if (settings.dm?.enable) {
          try {
            await member.send({
              content: formatBirthday.call(settings.dm.msg?.content, member, year),
              embeds: [createEmbed('dm', settings, member, year, this.defaultSettings.birthday)]
            });
          }
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