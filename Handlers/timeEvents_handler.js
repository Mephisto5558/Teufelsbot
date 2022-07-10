const
  { CronJob } = require('cron'),
  { MessageEmbed } = require('discord.js');

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

module.exports = async client => {
  // if (client.botType == 'dev') return client.log('Disabled timed events due to dev version.');

  await client.ready();

  //Birthday announcer
  new CronJob('00 00 00 * * *', async function () {
    const now = new Date().toLocaleString('en', { month: '2-digit', day: '2-digit' });

    //if (client.db.get('birthdays').lastCheckTS == now) return client.log('Already ran birthday check today');
    client.log('started birthday check');

    await client.rateLimitCheck('/users/@me/guilds');

    const
      guilds = await client.guilds.fetch(),
      oldData = await client.db.get('birthdays'),
      gSettings = await client.db.get('settings');

    for (let guild of guilds) {
      const settings = gSettings[guild[0]]?.birthday;
      if (!gSettings[guild[0]]?.enabledModules?.includes('birthday')) continue;

      await client.rateLimitCheck('/users/@me/guilds');
      guild = await client.guilds.fetch(guild[0]);

      for (const entry of Object.entries(oldData)) {
        let channel, user;
        const entry0 = entry[1].split('/');
        entry[2] = entry0.shift();
        if (now != entry0.join('/') || entry[0] == 'lastCheckTS') continue;

        try { user = await guild.members.fetch(entry[0]) }
        catch (err) {
          if (err.code == 10007) continue;
          else throw err;
        }

        if (settings?.channelAnnouncement?.channel) {
          try { channel = await guild.channels.fetch(settings.channelAnnouncement.channel) }
          catch {
            return (await guild.fetchOwner()).send(`INFO: the channel configured for the birthday feature in guild \`${guild.name}\` does not exist! Please re-configure it so i can send birthday messages!`)
          }

          const embed = new MessageEmbed({
            title: formatBirthday(settings.channelAnnouncement?.embed?.title || gSettings.default.birthday.channelAnnouncement.embed.title, user, entry[2])?.replace(/<age>\.?/g, ''),
            description: formatBirthday(settings.channelAnnouncement?.embed?.description || gSettings.default.birthday.channelAnnouncement.embed.description, user, entry[2])?.replace(/<age>\.?/g, ''),
            color: settings.channelAnnouncement?.embed?.color || gSettings.default.birthday.channelAnnouncement.embed.color
          });

          await channel.send({ content: settings.channelAnnouncement?.content?.replace(/<age>\.?/g, '') || gSettings.default.birthday.channelAnnouncement.content, embeds: [embed] });
        }

        if (settings?.dmAnnouncement?.enabled) {
          const embed = new MessageEmbed({
            title: formatBirthday(settings.dmAnnouncement?.embed?.title || gSettings.default.birthday.dmAnnouncement.embed.title, user, entry[2])?.replace(/<age>\.?/g, ''),
            description: formatBirthday(settings.dmAnnouncement?.embed?.description || gSettings.default.birthday.dmAnnouncement.embed.description, user, entry[2])?.replace(/<age>\.?/g, ''),
            color: settings.dmAnnouncement?.color || gSettings.default.birthday.dmAnnouncement.embed.color
          });

          try {
            await user.send({ content: settings.dmAnnouncement?.content?.replace(/<age>\.?/g, '') || gSettings.default.birthday.dmAnnouncement.content, embeds: [embed] });
          } catch { }
        }
      }
    }

    client.log('Finished birthday check');
    client.db.set('birthdays', Object.assign({}, oldData, { 'lastCheckTS': now }));
  },
    null,
    true,
    undefined,
    undefined,
    true
  )

}