const { MessageEmbed } = require("discord.js");
var embed = require("../Settings/embed.json");
var noPerm = false;


module.exports = async (client, interaction) => {

  if(interaction.isCommand()) {
    interaction.args = [];
    await interaction.deferReply({ ephemeral: false });
    const command = client.commands.get(interaction.commandName);
    if(!command) return;
        
    for (let option of interaction.options.data) {
      if(option.type === "SUB_COMMAND") {
        if(option.name) interaction.args.push(option.name);
        option.options?.forEach((x) => {
          if(x.value) interaction.args.push(x.value);
        });
      }
      else if(option.value) interaction.args.push(option.value);
    }
    
    interaction.member = interaction.guild.members.cache.get(interaction.user.id);
    if(interaction.member.id === client.user.id) interaction.followUp(`Its Me...`)
    
      // checking user perms
    if (!interaction.member.permissions.has('SEND_MESSAGES') || !interaction.member.permissions.has(command.userPermissions)) {
     command.userPermissions.push('SEND_MESSAGES')
     return interaction.followUp({
      embeds: [
        new MessageEmbed()
          .setColor(embed.embed_color)
          .setDescription(`You need ${command.userPermissions} permission to run this command..`)
        ]
      });
    }
    
    command.run(client, null, interaction);
  }

  if(interaction.isContextMenu()) {
    await interaction.deferReply({ ephemeral: false });
    const command = client.commands.get(interaction.commandName);
    if(command) command.run(client, null, interaction);
  }
}