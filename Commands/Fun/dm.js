const { Command } = require("reconlx");

module.exports = new Command({
  name: 'dm',
  aliases: [],
  description: `sends a user a dm`,
  userPermissions: [],
  category : "Fun",
  slashCommand: true,
  run: (client, message, interaction) => {

    if(interaction) {
      console.log(interaction);
    }
    return;
    
    if(!isNaN(message.args[0])) return client.functions.reply('You forgot to mention a user!')
    userID = message.args[0]
      .replace('<@','')
      .replace('>','')
      .replace('!','')

    message.args.shift()
    message.args = message.args.join(' ')
    if(message.args.length === 0) return client.functions.reply('You must give me a message to send!', message)
  
    client.users.fetch(userID, false).then((user) => {
      user.send(`${message.args}\n||Message sent by ${message.member.user.tag}. If you don't want to receive user-made dms from me, run .disabledm in any server.||`)
    });
  }
  
})