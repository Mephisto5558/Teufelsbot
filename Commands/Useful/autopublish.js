const { Command } = require('reconlx');

module.exports = new Command({
  name: 'autopublish',
  aliases: { prefix: [], slash: [] },
  description: 'automatically publishes everything anyone in an announcement channel says.',
  usage:
    'This command publishes all messages send in announcement channels automatically.\n' +
    'Run the command once to enable it, another time to disable it.',
  permissions: { client: ['MANAGE_MESSAGES'], user: ['MANAGE_GUILD'] },
  cooldowns: { guild: 200, user: 0 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: true,

  run: async(client, message, interaction) => {
    if(interaction) message = interaction;

    const oldData = await client.db.get('autopublish');

    if(oldData.includes(message.guild.id)) {
      const newData = oldData.filter(e => e != message.guild.id);

      await client.db.set('autopublish', newData);

      if(interaction) interaction.editReply('Disabled autopublishing.');
      else client.functions.reply('Disabled autopublishing.');
    }
    else {
      await client.db.push('autopublish', message.guild.id);

      if(interaction) interaction.editReply('Enabled autopublishing.');
      else client.functions.reply('Enabled autopublishing.');
    }
  }
})