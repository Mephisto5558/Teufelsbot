const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");

module.exports = new Command({
  name: 'kick',
  aliases: [],
  description: `kicks a member from the server`,
  permissions: {client: ['KICK_MEMBERS'], user: ['KICK_MEMBERS']},
  category : "Moderation",
  slashCommand: true,
  options: [
    {
      name: "user",
      description: `Who want you to get kicked`,
      type: "USER",
      required: true
    },
    {
      name: "reason",
      description: `The user will see the reason in a dm`,
      type: "STRING",
      required: true
    }
  ],
  run: async (client, _, interaction) => {

    if(!interaction) return;
    
    const user = interaction.options.getUser('user');

    if(user.roles.highest.position > interaction.guild.members.fetch(interaction.member).highest.position) {
      return interaction.followUp("You don't have the permission to do that!")
    };
    
    if (!user.kickable) {
      return interaction.followUp("I don't have the permission to do that!")
    };

    if (user.id === interaction.member.id) {
      return interaction.followUp(`You can't kick yourself!`)
    }

    var embed = new MessageEmbed()
      .setTitle(`**Kicked**`)
      .setDescription(
        `You have been kicked from ${message.guild.name}.` +
        `Moderator: ${message.author.tag}` +
        `Reason   : ${interaction.options.getString('reason')}`
      )

    try { user.kick({ reason: reason }) }
    catch { return interaction.followUp("I couldn't kick that user") }
  
    try { user.send({ embeds: [embed] }) }
    catch { var noMsg = true }

    description = `:wave: ${member.displayName} has been successfully kicked :point_right:`
    if(noMsg) description = `${description}\nI Couldn't dm the user.`
        
    var embed = new MessageEmbed()
      .setTitle('**Kick**')
      .setDescription(description)
    
    
    interaction.followUp({ embeds: [embed] })
  }
})
