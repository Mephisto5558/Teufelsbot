const { Command } = require("reconlx");

module.exports = new Command({
  name: 'ban',
  aliases: [],
  description: `bans a member from the server`,
  userPermissions: ['BAN_MEMBERS'],
  category : "Moderation",
  slashCommand: false,
  options: [
    {
      name: "user",
      description: `Who want you to get banned`,
      type: "USER",
      required: true
    },
    {
      name: "duration",
      description: `How long want you to get this user banned, empty for permament`,
      type: "NUMBER",
      required: false
    },
    {
      name: "reason",
      description: `The user will see the reason in a dm`,
      type: "STRING",
      required: true
    }
  ],
  run: async (client, message, interaction) => {
    const { MessageEmbed } = require("discord.js");

    if(!interaction) {
      await client.functions.reply('Please use `/ban` instead of `.ban!`', message, 10000)
      return message.delete();
    }

    const user = client.users.fetch(interaction.options.getUser('user'), false);
    
    if (!user.bannable) {
      return interaction.followUp("I don't have the permission to do that!")
    }

    if (user.id === message.author.id && !force) {
      return interaction.followUp(`You can't ban yourself!`)
    }

    var embed = new MessageEmbed()
      .setTitle(`**banned**`)
      .setDescription(
        `You have been banned from ${message.guild.name}.` +
        `Moderator: ${message.author.tag}` +
        `Reason   : ${interaction.options.getString('reason')}`
      )

    try { user.ban({ reason: reason }) }
    catch { return interaction.followUp("I could'nt ban the user") }
  
    try { user.send({ embeds: [embed] }) }
    catch { var noMsg = true; }

    description = `:wave: ${member.displayName} has been successfully banned :point_right:`
    if(noMsg) description = `${description}\nI Couldn't dm the user.`
        
    var embed = new MessageEmbed()
      .setTitle('**Ban**')
      .setDescription(description)
    
    
    interaction.followUp({ embeds: [embed] })
  }
})
