const { EmbedBuilder } = require('discord.js');

function formatBirthday(msg, user, year) {
  return msg?.replace(/<user.nickname>/g, user.displayName)
    .replace(/<user.username>/g, user.username)
    .replace(/<user.id>/g, user.id)
    .replace(/<user.tag>/g, user.tag)
    .replace(/<user.joinedAt>/g, user.joinedAt.toLocaleDateString('en'))
    .replace(/<guild.id>/g, user.guild.id)
    .replace(/<guild.memberCount>/g, user.guild?.memberCount)
    .replace(/<guild.name>/g, user.guild?.name)
    .replace(/<bornyear>/g, year)
    .replace(/<date>/g, new Date().toLocaleDateString('en'))
    .replace(/<age>/g, parseInt(year) ? new Date().getFullYear() - year : '<age>'); //<guilds> gets replaced below
}

module.exports = {
  time: '00 00 00 * * *',
  startNow: true,

  onTick: async ({ db, guilds, log }) => {
    const now = new Date().toLocaleString('en', { month: '2-digit', day: '2-digit' });

    if (db.get('botSettings').lastBirthdayCheck == now) return log('Already ran birthday check today');
    log('started birthday check');

    const
      guildList = (await guilds.fetch()).map(e => e.fetch()),
      oldData = db.get('userSettings');

    for await (const guild of guildList) {
      const settings = db.get('guildSettings')[guild.id]?.birthday;
      const defaultSettings = db.get('guildSettings').default.birthday;
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
            title: formatBirthday(settings.ch?.msg?.embed?.title || defaultSettings.ch.msg.embed?.title, user, entry[2])?.replace(/<age>\.?/g, ''),
            description: formatBirthday(settings.ch?.msg?.embed?.description || defaultSettings.ch.msg.embed?.description, user, entry[2])?.replace(/<age>\.?/g, ''),
            color: settings.ch?.msg?.embed?.color || defaultSettings.ch.msg.embed?.color
          });

          await channel.send({ content: settings.ch?.msg?.content?.replace(/<age>\.?/g, '') || defaultSettings.ch.msg.content, embeds: [embed] });
        }

        if (settings?.dm?.enable) {
          const embed = new EmbedBuilder({
            title: formatBirthday(settings.dm?.msg?.embed?.title || defaultSettings.dm.msg.embed?.title, user, entry[2])?.replace(/<age>\.?/g, ''),
            description: formatBirthday(settings.dm?.msg?.embed?.description || defaultSettings.dm.msg.embed?.description, user, entry[2])?.replace(/<age>\.?/g, ''),
            color: settings.dm?.msg?.embed?.color || defaultSettings.dm.msg.embed?.color
          });

          try {
            await user.send({ content: settings.dm?.msg?.content?.replace(/<age>\.?/g, '') || defaultSettings.dm.msg.content, embeds: [embed] });
          } catch { }
        }
      }
    }

    db.set('botSettings', db.get('botSettings').merge({ 'lastBirthdayCheck': now }));
    log('Finished birthday check');
  }
}