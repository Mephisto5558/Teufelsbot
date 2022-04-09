const { Command } = require("reconlx");

module.exports = new Command({
  name: 'purge',
  aliases: [],
  description: `removes a specific number of messages`,
  userPermissions: ['MANAGE_MESSAGES'],
  category : "Moderation",
  slashCommand: false,
  run: async (client, message, interaction) => {
    
    if (!message.guild.me.permissions.has('MANAGE_MESSAGES')) {
      return client.functions.reply("I don't have the permission to do that!", message)
    }
  
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return client.functions.reply("You don't have the permission to do that!", message)
    }

    if(message.args.length === 0) return client.functions.reply("Please provide a number next time.", message);

    var toDeleteCount = parseInt(message.args[0]) + 1 //+1 is the command
    var deletedCount = 0
  
    while(toDeleteCount !== 0) {
      if(toDeleteCount - deletedCount >= 100) {
        await message.channel.bulkDelete(100)
        deletedCount = deletedCount + 100
      }
      else {
        await message.channel.bulkDelete(toDeleteCount - deletedCount)
        toDeleteCount = 0
      }
      if(toDeleteCount !== 0) await client.functions.sleep(1000);
    }
    client.functions.reply(`Successful deleted messages.`, message, 1000)
    
  }
})