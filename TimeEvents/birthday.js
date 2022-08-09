const { EmbedBuilder } = require('discord.js');

function formatBirthday(msg, user, year) {
  if (!msg) return;
  return msg
    .replace(/<user.nickname>/g, user.nickname)
    .replace(/<user.username>/g, user.username)
    .replace(/<user.id>/g, user.id)
    .replace(/<user.tag>/g, user.tag)
    .replace(/<user.joinedAt>/g, user.joinedAt.toLocaleDateString('en'))
    .replace(/<guild.id>/g, user.guild.id)
    .replace(/<guild.memberCount>/g, user.guild?.memberCount)
    .replace(/<guild.name>/g, user.guild?.name)
    .replace(/<bornyear>/g, year)
    .replace(/<date>/g, new Date().toLocaleDateString('en'))
    .replace(/<age>/g, parseInt(year) ? new Date().getFullYear() - year : '<age>') //<guilds> gets replaced below
}

module.exports = {
  time: '00 00 00 * * *',
  startNow: true,

  onTick: async ({ db, guilds, log }) => {
    const now = new Date().toLocaleString('en', { month: '2-digit', day: '2-digit' });

    if (db.get('botSettings').lastBirthdayCheck == now) return log('Already ran birthday check today');
    log('started birthday check');

    const
      guildList = await guilds.fetch(),
      oldData = await db.get('userSettings');

    for (let guild of guildList) {
      const settings = await db.get('guildSettings')[guild[0]]?.birthday;
      const defaultSettings = await db.get('guildSettings').default?.birthday;
      if (!settings?.enable) continue;

      guild = await guilds.fetch(guild[0]);

      for (const entry of Object.entries(oldData).map(([k, v]) => ({ [k]: v.birthday }))) {
        let channel, user;
        const entry0 = entry[1].split('/');
        entry[2] = entry0.shift();
        if (now != entry0.join('/')) continue;

        try { user = await guild.members.fetch(entry[0]) }
        catch (err) {
          if (err.code == 10007) continue;
          else throw err;
        }

        if (settings?.ch?.msg?.channel) {
          try { channel = await guild.channels.fetch(settings.ch?.msg.channel) }
          catch {
            return (await guild.fetchOwner()).send(`INFO: the channel configured for the birthday feature in guild \`${guild.name}\` does not exist! Please re-configure it so i can send birthday messages!`)
          }

          const embed = new EmbedBuilder({
            title: formatBirthday(settings.ch?.msg?.embed?.title || defaultSettings?.ch?.msg?.embed?.title, user, entry[2])?.replace(/<age>\.?/g, ''),
            description: formatBirthday(settings.ch?.msg?.embed?.description || defaultSettings?.ch?.msg?.embed?.description, user, entry[2])?.replace(/<age>\.?/g, ''),
            color: settings.ch?.msg?.embed?.color || defaultSettings?.ch?.msg?.embed.color
          });

          await channel.send({ content: settings.ch?.msg?.content?.replace(/<age>\.?/g, '') || defaultSettings?.ch?.msg?.content, embeds: [embed] });
        }

        if (settings?.dm?.msg?.enabled) {
          const embed = new EmbedBuilder({
            title: formatBirthday(settings.dm?.msg?.embed?.title || defaultSettings?.dm?.msg?.embed?.title, user, entry[2])?.replace(/<age>\.?/g, ''),
            description: formatBirthday(settings.dm?.msg?.embed?.description || defaultSettings?.dm?.msg?.embed?.description, user, entry[2])?.replace(/<age>\.?/g, ''),
            color: settings.dm?.msg?.embed?.color || defaultSettings?.dm?.msg?.embed?.color
          });

          try {
            await user.send({ content: settings.dm?.msg?.content?.replace(/<age>\.?/g, '') || defaultSettings?.dm?.msg?.content, embeds: [embed] });
          } catch { }
        }
      }
    }

    log('Finished birthday check');
    db.set('botSettings', Object.merge(await db.get('botSettings'), { 'lastBirthdayCheck': now }));
  }

}