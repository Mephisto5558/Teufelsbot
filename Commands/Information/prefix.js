const { Command } = require("reconlx");

module.exports = new Command({
  name: 'prefix',
  aliases: [],
  description: `changes(WIP) or shows the guild prefix`,
  permissions: {client: [], user: []},
  category : "Information",
  slashCommand: false,
  run: async (client, message, interaction) => {
    
    return client.functions.reply(`The prefix command is curently disabled (default prefix: '.')`, message);

    message.args = message.args.toString().trim();
    if (!message.args) {
      return client.functions.reply(`My current prefix is \`${prefix.getPrefix(message.guild.id)}\``, message)   
    }
  
    if (!message.member.permissions.has('MANAGE_SERVER')) {
      return client.functions.reply("You don't have the permission to do that!", message)
    }
  
    prefix.setPrefix(message.args, message.guild.id)
    client.functions.reply(`My prefix has been changed to \`${message.args}\``, message)

  }
})