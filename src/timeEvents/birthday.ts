import { BaseGuildTextChannel, EmbedBuilder, inlineCode, GuildMember, Guild, DiscordAPIError } from 'discord.js';
import { DiscordAPIErrorCodes } from '#utils';
import type { CronJob } from './index.ts';

function formatBirthday(this: StringConstructor | string | undefined, member: GuildMember, year?: number) {
  return this?.toString().replaceAll('{user.nickname}', member.displayName)
    .replaceAll('{user.username}', member.user.username)
    .replaceAll('{user.id}', member.id)
    .replaceAll('{user.tag}', member.user.tag)
    .replaceAll('{user.createdAt}', member.user.createdAt.toLocaleDateString('en'))
    .replaceAll('{user.joinedAt}', member.joinedAt!.toLocaleDateString('en'))
    .replaceAll('{guild.id}', member.guild.id)
    .replaceAll('{guild.memberCount}', member.guild.memberCount.toString())
    .replaceAll('{guild.name}', member.guild.name)
    .replaceAll('{bornyear}', year?.toString() ?? '')
    .replaceAll('{date}', Temporal.Now.plainDateISO().toLocaleString())
    .replaceAll('{age}', year ? (Temporal.Now.plainDateISO().year - year).toString() : '{age}')
    .replaceAll(/\{age\}\.?/g, ''); // {guilds} gets replaced below
}

function createEmbed(
  type: 'ch' | 'dm',
  settings: NonNullable<Database['guildSettings'][Snowflake]['birthday']>,
  member: GuildMember, year: number,
  defaultSettings: Database['botSettings']['defaultGuild']['birthday']
): EmbedBuilder {
  return new EmbedBuilder({
    title: formatBirthday.call(settings[type].msg?.embed?.title ?? defaultSettings[type].msg.embed.title, member, year),
    description: formatBirthday.call(settings[type].msg?.embed?.description ?? defaultSettings[type].msg.embed.description, member, year),
    color: settings[type].msg?.embed?.color ?? defaultSettings[type].msg.embed.color
  });
}

async function getChannel(
  this: Client, settings: NonNullable<Database['guildSettings'][Snowflake]['birthday']>, guild: Guild
): Promise<BaseGuildTextChannel | undefined> {
  if (!settings.ch?.channel) return;

  try {
    const channel = await guild.channels.fetch(settings.ch.channel);
    return channel instanceof BaseGuildTextChannel ? channel : undefined;
  }
  catch (err) {
    if (!(err instanceof DiscordAPIError) || err.code != DiscordAPIErrorCodes.UnknownChannel) throw err;

    const owner = await guild.fetchOwner();
    void owner.send(this.i18n.__({ locale: owner.localeCode }, 'others.timeEvents.birthday.unknownChannel', inlineCode(guild.name))).catch(() => {
      if (err.code == DiscordAPIErrorCodes.CannotSendMessagesToThisUser) return;
      throw err;
    });
  }
}

export default {
  time: '00 00 00 * * *',
  startNow: true,

  async onTick(): Promise<void> {
    const now = Temporal.Now.plainDateISO();

    if (this.settings.timeEvents.lastBirthdayCheck?.equals(now)) return void log('Already ran birthday check today');
    log('Started birthday check');

    await this.guilds.fetch();
    for (const [, guild] of this.guilds.cache) {
      const settings = guild.db.birthday;
      if (!settings?.enable || !settings.ch?.channel && !settings.dm?.enable) continue;

      const birthdayUserList = Object.entries(this.db.get('userSettings')).reduce<Record<Snowflake, number>>((acc, [id, e]) => {
        if (e.birthday?.month == now.month && e.birthday.day == now.day) acc[id] = e.birthday.year;
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

        if (!settings.dm?.enable) continue;
        try {
          await member.send({
            content: formatBirthday.call(settings.dm.msg?.content, member, year),
            embeds: [createEmbed('dm', settings, member, year, this.defaultSettings.birthday)]
          });
        }
        catch (err) {
          if (!(err instanceof DiscordAPIError) || err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;
        }
      }
    }

    await this.db.update('botSettings', 'timeEvents.lastBirthdayCheck', now);
    log('Finished birthday check');
  }
} satisfies CronJob;