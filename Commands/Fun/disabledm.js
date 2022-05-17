const
  { Command } = require("reconlx"),
  msg =
    'You are now blocklisted from the dm command.\n' +
    'This will not prevent server moderators from sending dms to you.';

module.exports = new Command({
  name: 'disabledm',
  aliases: [],
  description: 'Disables user-made bot dms',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,

  run: async(client, message, interaction) => {

    await client.db.push('dmCommandBlocklist', message.author.id);

    if(message) client.functions.reply(msg, message);
    else interaction.followUp(msg);

  }
})