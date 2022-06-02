const { CronJob } = require('cron');
const { MessageEmbed } = require('discord.js');
const colorConfig = require('../Settings/embed.json').colors;
let jobs = [];

function fBD(msg, user, year) { //formatBirthday
  return msg
    .replace(/<user>/g, user.displayName)
    .replace(/<age>/g, new Date().getFullYear() - year) //<guilds> gets replaced below
}

module.exports = async client => {
  const guilds = await client.guilds.fetch();

  //Birthday announcer
  jobs.push( new CronJob('00 00 00 * * *', async _ => {
    const oldData = await client.db.get('birthdays');
    const gSettings = await client.db.get('settings');
    const now = new Date().toLocaleString('en', { month: '2-digit', day: '2-digit' });
    let dmList = [];

    for (let guild of guilds) {
      let settings = gSettings[guild.id]?.birthday;
      guild = await client.guilds.fetch(guild[0]);

      if (settings?.disabled) continue;

      for (let entry of Object.entries(oldData)) {
        let mention = '';
        let channel;
        let entry0 = entry[1].split('/');
        entry[2] = await entry0.shift();
        if (now != entry0.join('/')) continue;

        if (settings?.channelAnnouncement?.channel) {
          try { channel = await guild.channels.fetch(settings.channelAnnouncement.channel) }
          catch { };

          let user = await guild.members.fetch(entry[0]);
          let embed = new MessageEmbed()
            .setTitle(fBD(settings.channelAnnouncement?.title, user, entry[2]) || `Happy birthday ${user.displayName}!`)
            .setDescription(fBD(settings.channelAnnouncement?.message, user, entry[2]) || 'We hope you have the wonderful birthday.')
            .setColor(settings.channelAnnouncement.color || colorConfig.discord.BURPLE);

          if (settings.channelAnnouncement?.mentionMember) mention = `<@${user.id}>`
          await channel.send({ content: mention, embeds: [embed] });
        }

        if (settings?.dmMembers) {
          embed = new MessageEmbed()
            .setTitle(fBD(settings.dmAnnouncement?.title, user, entry[2]) || `Happy birthday!`)
            .setDescription(
              `${fBD(settings.dmAnnouncement?.message, user, entry[2]) || 'Happy birthday to you! 🎉'}\n` +
              `All your friends on the guilds <guilds> wish you a great day`
            )
            .setColor(settings.dmAnnouncement?.color || colorConfig.discord.BURPLE)
          dmList[entry[0]].push(guild.name);
        }
      }
    }

    for (let user of Object.entries(dmList)) {
      try {
        user = client.users.fetch(user[0]);
        embed.description.replace('<guilds>', `\`${dmList[user].join('`,` ')}\``);

        await user.send({ embeds: [embed] });
      }
      catch { }
    }
  }, _ => client.log('finished birthday check')) );

  for (let job of jobs) {
    job.start();
  }

}