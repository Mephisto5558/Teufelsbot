const
  { CronJob } = require('cron'),
  { MessageEmbed } = require('discord.js'),
  { colors } = require('../Settings/embed.json');

function formatBirthday(msg, user, year) {
  return msg
    .replace(/<user>/g, user.displayName)
    .replace(/<age>/g, new Date().getFullYear() - year) //<guilds> gets replaced below
}

module.exports = async client => {
  if (client.botType == 'dev') return client.log('Disabled timed events due to dev version.');
  
  await client.isReady();

  //Birthday announcer
  new CronJob('00 00 00 * * *', async function () {
    const now = new Date().toLocaleString('en', { month: '2-digit', day: '2-digit' });

    if (client.db.get('birthdays').lastCheckTS == now) return client.log('Already ran birthday check today');

    client.log('started birthday check');

    const
      guilds = await client.guilds.fetch(),
      oldData = await client.db.get('birthdays'),
      gSettings = await client.db.get('settings');

    let dmList = [];

    for (let guild of guilds) {
      const settings = gSettings[guild[0]]?.birthday;
      if (settings?.disabled)
        continue;

      guild = await guild[1].fetch();

      for (const entry of Object.entries(oldData)) {
        let mention;
        let channel;
        const entry0 = entry[1].split('/');
        entry[2] = entry0.shift();
        if (now != entry0.join('/') || entry[0] == 'lastCheckTS') continue;

        if (settings?.channelAnnouncement?.channel) {
          try { channel = await guild.channels.fetch(settings.channelAnnouncement.channel) }
          catch {
            return (await guild.fetchOwner()).send(`INFO: the channel configured for the birthday feature in guild \`${guild.name}\` does not exist! Please re-configure it so i can send birthday messages!`)
          }

          const user = await guild.members.fetch(entry[0]);

          let embed = new MessageEmbed()
            .setTitle(formatBirthday(settings.channelAnnouncement?.title, user, entry[2]) || `Happy birthday ${user.displayName}!`)
            .setDescription(formatBirthday(settings.channelAnnouncement?.message, user, entry[2]) || 'We hope you have the wonderful birthday.')
            .setColor(settings.channelAnnouncement.color || colors.discord.BURPLE);

          if (settings.channelAnnouncement?.mentionMember) mention = `<@${user.id}>`;
          await channel.send({ content: mention || '', embeds: [embed] });
        }

        if (settings?.dmMembers) {
          embed = new MessageEmbed()
            .setTitle(formatBirthday(settings.dmAnnouncement?.title, user, entry[2]) || `Happy birthday!`)
            .setDescription(
              `${formatBirthday(settings.dmAnnouncement?.message, user, entry[2]) || 'Happy birthday to you! 🎉'}\n` +
              `All your friends on the guilds <guilds> wish you a great day`
            )
            .setColor(settings.dmAnnouncement?.color || colors.discord.BURPLE);

          dmList[entry[0]].push(guild.name);
        }
      }
    }

    for (let user of Object.entries(dmList)) {
      try {
        user = await client.users.fetch(user[0]);
        embed.description.replace('<guilds>', `\`${dmList[user].join('`,` ')}\``);

        await user.send({ embeds: [embed] });
      }
      catch { }
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