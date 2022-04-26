const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");

module.exports = new Command({
  name: 'ban',
  aliases: [],
  description: `bans a member from the server`,
  permissions: {client: ['BAN_MEMBERS'], user: ['BAN_MEMBERS']},
  category : "Moderation",
  slashCommand: true,
  options: [
    {
      name: "member",
      description: `Who want you to get banned`,
      type: "USER",
      required: true
    },
    {
      name: "reason",
      description: `The user will see the reason in a dm`,
      type: "STRING",
      required: true
    },
    {
      name: "duration",
      description: `COMMING SOON`,//How long want you to get this user banned, empty for permament`,
      type: "NUMBER",
      required: false,
      disabled: true
    }
  ],
  run: async (client, _, interaction) => {

    if(!interaction) return;
    const user = interaction.options.getUser('user');

    if (user.user.id === interaction.member.id) {
      return interaction.followUp(`You can't ban yourself!`)
    };
    
    if (user.roles.highest.position > interaction.member.highest.position) {
      return interaction.followUp("You don't have the permission to do that!")
    };
    
    if (!user.bannable) {
      return interaction.followUp("I don't have the permission to do that!")
    };

    var embed = new MessageEmbed()
      .setTitle(`**Banned**`)
      .setDescription(
        `You have been banned from ${message.guild.name}.` +
        `Moderator: ${message.author.tag}` +
        `Reason   : ${interaction.options.getString('reason')}`
      )

    try { user.ban({ reason: reason }) }
    catch { return interaction.followUp("I couldn't ban the user") }
  
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
