const { EmbedBuilder } = require('discord.js');

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
    .replaceAll('<age>', parseInt(year) ? new Date().getFullYear() - year : '<age>')
    .replace(/<age>\.?/g, ''); //<guilds> gets replaced below
}

module.exports = {
  time: '00 00 00 * * *',
  startNow: true,

  onTick: async function () {
    const now = new Date().toLocaleString('en', { month: '2-digit', day: '2-digit' });

    if (this.db.get('botSettings').lastBirthdayCheck == now) return this.log('Already ran birthday check today');
    this.log('started birthday check');

    const
      guildList = (await this.guilds.fetch()).map(e => e.fetch()),
      oldData = this.db.get('userSettings');

    for await (const guild of guildList) {
      const settings = this.db.get('guildSettings')[guild.id]?.birthday;
      const defaultSettings = this.db.get('guildSettings').default.birthday;
      if (!settings?.enable) continue;

      const userList = Object.entries(oldData)
        .map(([k, { birthday } = {}]) => [k, birthday?.slice(5)])
        .filter(([, v]) => v == now);

      for (const entry of userList) {
        let channel, user;

        try { user = await guild.members.fetch(entry[0]) }
        catch (err) {
          if (err.code == 10007) continue;
          else throw err;
        }

        if (settings?.ch?.channel) {
          try { channel = await guild.channels.fetch(settings.ch.channel) }
          catch {
            return (await guild.fetchOwner()).send(`INFO: the channel configured for the birthday feature in guild \`${guild.name}\` does not exist! Please re-configure it so i can send birthday messages!`)
          }

          const embed = new EmbedBuilder({
            title: formatBirthday.call(settings.ch?.msg?.embed?.title || defaultSettings.ch.msg.embed.title, user, entry[2]),
            description: formatBirthday.call(settings.ch?.msg?.embed?.description || defaultSettings.ch.msg.embed.description, user, entry[2]),
            color: settings.ch?.msg?.embed?.color || defaultSettings.ch.msg.embed.color
          });

          await channel.send({ content: formatBirthday.call(settings.ch?.msg?.content || defaultSettings.ch.msg.content, user, entry[2]), embeds: [embed] });
        }

        if (settings?.dm?.enable) {
          const embed = new EmbedBuilder({
            title: formatBirthday.call(settings.dm?.msg?.embed?.title || defaultSettings.dm.msg.embed.title, user, entry[2]),
            description: formatBirthday.call(settings.dm?.msg?.embed?.description || defaultSettings.dm.msg.embed.description, user, entry[2]),
            color: settings.dm?.msg?.embed?.color || defaultSettings.dm.msg.embed.color
          });

          try {
            await user.send({ content: formatBirthday.call(settings.dm?.msg?.content || defaultSettings.dm.msg.content, user, entry[2]), embeds: [embed] });
          } catch { }
        }
      }
    }

    this.db.set('botSettings', this.db.get('botSettings').fMerge({ lastBirthdayCheck: now }));
    this.log('Finished birthday check');
  }
}
