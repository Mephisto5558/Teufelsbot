const { Command } = require('reconlx');
const { Message } = require('discord.js');

module.exports = new Command({
  name: 'autopublish',
  aliases: { prefix: [], slash: [] },
  description: 'automatically publishes everything anyone in an announcement channel says.',
  usage:
    'This command publishes all messages send in announcement channels automatically.\n' +
    'This is a toggle.',
  permissions: { client: ['ManageGuild'], user: ['ManageGuild'] },
  cooldowns: { guild: 1000, user: 0 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: true,

  run: async (message, { db, functions }) => {
    const oldData = await db.get('guildSettings');
    const setting = oldData[message.guild.id]?.config?.autopublish;

    const newData = Object.merge(oldData, { [message.guild.id]: { config: { autopublish: !setting } } })
    await db.set('guildSettings', newData);

    if (message instanceof Message) functions.reply(`${setting ? 'Disabled' : 'Enabled'} autopublishing.`, message);
    else message.editReply(`${setting ? 'Disabled' : 'Enabled'} autopublishing.`);
  }
})