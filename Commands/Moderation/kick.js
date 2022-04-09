const { Command } = require("reconlx");

module.exports = new Command({
  name: 'kick',
  aliases: [],
  description: `kicks a member from the guild`,
  userPermissions: ['KICK_MEMBERS'],
  category : "Moderation",
  slashCommand: false,
  run: async (client, message, interaction) => {

    if (message.content && message.content.toLowerCase().endsWith('--force')) {
      var force = true
      message.args = message.args.toString();
      message.args = message.args.substring(0, message.args.toLowerCase().lastIndexOf('--force'));
    }

    var user = message.mentions.members.first();
    const reason = 0// message.args.slice(1).join(' ');

    if (!message.member.permissions.has('KICK_MEMBERS')) {
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

    if (!user.kickable) {
      return client.functions.reply("I don't have the permission to do that!", message)   
    }

    if (user.id === message.author.id && !force) {
      return client.functions.reply(`You can't kick yourself!`, message)
    }

    if (!reason && !force) {
      return client.functions.reply('You forgot to enter a reason for this kick!', message)
    }
  
    try {
      user.send(`You have been kicked from ${message.guild.name}.
Moderator: ${message.author.tag}
Reason   : ${reason}`)
    }
    catch {
      var noMsg = true
    }

    message.mentions.members.first().kick({ reason: reason })
      .then((member) => {
        client.functions.reply(`:wave: ${member.user.tag} has been successfully kicked :point_right:`, message);
        if(noMsg) { client.functions.reply(`I Couldn't dm the user.`, message) }
        if(user.id === message.author.id) { client.functions.reply('https://tenor.com/view/button-kick-gif-10790675', message) }
      })
    
  }
})