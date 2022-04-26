const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");
const embedConfig = require('../../Settings/embed.json');

module.exports = new Command({
  name: 'kick',
  aliases: [],
  description: `kicks a member from the server`,
  permissions: {client: ['KICK_MEMBERS'], user: ['KICK_MEMBERS']},
  category : "Moderation",
  slashCommand: true,
  options: [
    {
      name: "member",
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
    let user = interaction.options.getUser('member');
    let noMsg;
    user = await interaction.guild.members.fetch(user.id);
    const moderator = `${interaction.member.user.username}#${interaction.member.user.discriminator}`;
    
    const reason = interaction.options.getString('reason');
      
    if (user.id === interaction.member.id) {
      return interaction.followUp(`You can't kick yourself!`)
    };
    
    if (user.roles.highest.comparePositionTo(interaction.member.roles.highest) > -1) {
      return interaction.followUp("You don't have the permission to do that!")
    };
    
    if (!user.bannable) {
      return interaction.followUp("I don't have the permission to do that!")
    };

    var embed = new MessageEmbed()
      .setTitle(`Kicked`)
      .setDescription(
        `You have been kicked from \`${interaction.guild.name}\`.\n` +
        `Moderator: ${moderator}\n` +
        `Reason: ${reason}`
      )
    .setColor(embedConfig.color_red);

    try { await user.send({ embeds: [embed] }) }
    catch(err) { noMsg = true }
    
    try { await user.ban({ reason: reason }) }
    catch(err) {
      console.log(err);
      return interaction.followUp("I couldn't kick the user")
    }

    description = `${user.displayName} has been successfully kicked.\nReason: ${reason}`
    if(noMsg) description = `${description}\nI Couldn't dm the user.`
        
    var embed = new MessageEmbed()
      .setTitle('Kick')
      .setDescription(description)
      .setColor(embedConfig.color_red);
    
    interaction.followUp({ embeds: [embed] })
  }
  
})
