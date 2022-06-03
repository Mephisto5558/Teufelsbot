const { Command } = require("reconlx");

let deletedCount = 0
let errorMsg;

module.exports = new Command({
  name: 'purge',
  aliases: [],
  description: `removes a specific number of messages`,
  usage: 'PREFIX Command: purge <number>',
  permissions: { client: ['MANAGE_MESSAGES'], user: ['MANAGE_MESSAGES'] },
  cooldowns: { global: '', user: '' },
  category: "Moderation",
  slashCommand: false,
  prefixCommand: true,

  run: async(client, message, _) => {

    if (!message.guild.me.permissions.has('MANAGE_MESSAGES'))
      errorMsg = "I don't have the permission to do that!";
    else if (!message.member.permissions.has('MANAGE_MESSAGES'))
      errorMsg = "You don't have the permission to do that!";
    else if (message.args.length === 0)
      errorMsg = "Please provide a number next time.";
    
    if(errorMsg) return client.functions.reply(errorMsg, message);
    
    let toDeleteCount = parseInt(message.args[0]) + 1 //+1 is the command

    while (toDeleteCount !== 0) {
      if (toDeleteCount - deletedCount >= 100) {
        await message.channel.bulkDelete(100)
        deletedCount = deletedCount + 100
      } else {
        await message.channel.bulkDelete(toDeleteCount - deletedCount)
        toDeleteCount = 0
      }
      if (toDeleteCount !== 0) await client.functions.sleep(1000);
    }

  }
})