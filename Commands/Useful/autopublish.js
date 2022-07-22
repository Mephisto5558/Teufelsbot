const { Command } = require('reconlx');

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

  run: async ({ db, functions }, message, interaction) => {
    if (interaction) message = interaction;

    const oldData = await db.get('settings');
    const setting = oldData[message.guild.id]?.config?.autopublish;

    const newData = Object.merge(oldData, { [message.guild.id]: { config: { autopublish: !setting } } })
    await db.set('settings', newData);

    if (interaction) interaction.editReply(`${setting ? 'Disabled' : 'Enabled'} autopublishing.`);
    else functions.reply(`${setting ? 'Disabled' : 'Enabled'} autopublishing.`, message);
  }
})