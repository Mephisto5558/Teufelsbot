const { Command } = require('reconlx');

module.exports = new Command({
  name: 'autopublish',
  alias: [],
  description: 'automatically publishes everything anyone in an announcement channel says.',
  usage: 'This command publishes all messages send in announcement channels automatically.\nRun the command once to enable it, another time to disable it.',
  permissions: { client: ['MANAGE_MESSAGES'], user: ['MANAGE_GUILD'] },
  cooldowns: { global: 0, user: 0 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: true,

  run: async(client, message, interaction) => {
    if(interaction) message = interaction;

    const oldData = await client.db.get('autopublish');

    if(oldData.includes(message.guild.id)) {
      const newData = oldData.filter(e => e != message.guild.id);

      await client.db.set('autopublish', newData);
      client.guildData[message.guild.id].autoPublish = false;

      if(interaction) interaction.editReply('Disabled autopublishing.');
      else client.functions.reply('Disabled autopublishing.');
    }
    else {
      await client.db.push('autopublish', message.guild.id);
      if(client.guildData[message.guild.id]) client.guildData[message.guild.id].autoPublish = true;
      else client.guildData[message.guild.id] = { autoPublish: true };

      if(interaction) interaction.editReply('Enabled autopublishing.');
      else client.functions.reply('Enabled autopublishing.');
    }
  }
})