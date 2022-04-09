const { Command } = require("reconlx");

module.exports = new Command({
  name: 'ban',
  aliases: [],
  description: `permamently bans a member from the server`,
  userPermissions: ['BAN_MEMBERS'],
  category : "Moderation",
  slashCommand: false,
  run: async (client, message, interaction) => {

    if (message.content.toLowerCase().endsWith('--force')) {
      var force = true
      message.content = message.content.substring(0, message.content.toLowerCase().lastIndexOf('--force'))
    }

    var user = message.mentions.members.first();
    const reason = message.args.slice(1).join(' ');

    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return client.functions.reply("You don't have the permission to do that!", message)
    }

    if (!user) {
      try {
        user = message.guild.members.cache.get(message.args.slice(0, 1).join(' '));
        if(!user) {throw 'User is empty'} else {
          user = user.user
          if(!user) {throw 'User is empty'}
        }
      }
      catch {
        return client.functions.reply(`You forgot to mention a user!`, message)
      }
    }

    if (!user.bannable) {
      return client.functions.reply("I don't have the permission to do that!", message)
    }

    if (user.id === message.author.id && !force) {
      return client.functions.reply(`You can't ban yourself!`, message)
    }

    if (!reason && !force) {
      return client.functions.reply('You forgot to enter a reason for this ban!', message)    
    }
  
    try {
      user.send(`You have been banned from ${message.guild.name}.
Moderator: ${message.author.tag}
Reason   : ${reason}`)
    }
    catch { var noMsg = true }

    message.mentions.members.first().ban({ reason: reason })
      .then((member) => {
        client.functions.reply(`:wave: ${member.displayName} has been successfully banned :point_right:`, message)
        if(noMsg) { client.functions.reply(`I Couldn't dm the user.`, message) }
        if (user.id === message.author.id) { client.functions.reply('https://tenor.com/view/button-kick-gif-10790675', message) }
      })
    
  }
})