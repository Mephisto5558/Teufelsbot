const { Command } = require('reconlx');
const validTypes = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING', '1', '2', '3', '5'];

module.exports = new Command({
  name: 'setactivity',
  aliases: [],
  description: `sets the bot's activity`,
  usage: 'PREFIX Command: setactivity <activity>;[type]',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,

  run: async (client, message) => {
    message.args = message.content.trim().split(';');

    const activity = message.args[0];
    const type = message.args[1].toUpperCase();

    if (!type) type = 'PLAYING';
    else if (!validTypes.includes(type)) {
      return client.functions.reply(
        `Syntax error: Invalid type "${type}". Available types are:\n`
        `\`${validTypes.join(', ')}.`, message
      )
    }

    await client.user.setActivity(activity, { type: type });
    await client.db.set('activity', { name: activity, type: type })
    client.functions.reply(`Activity set to \`${activity}\` of type \`${type}\``, message);
  }
})