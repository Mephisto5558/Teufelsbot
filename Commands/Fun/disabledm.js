const
  { Command } = require("reconlx");

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

    await client.db.push('dmCommandBlocklist', message?.author.id || interaction?.member.id);
//ADD CHECK FOR DOUBLE ENTRY
    const msg =
      'You are now blocklisted from the dm command.\n' +
      'This will not prevent server moderators from sending dms to you.';

    if(message) client.functions.reply(msg, message);
    else interaction.followUp(msg);

  }
})