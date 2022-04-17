const { MessageEmbed } = require("discord.js");
var embed = require("../Settings/embed.json");

module.exports = async (client, interaction) => {
  interaction.args = [];

  if(interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if(!command) return;
    await interaction.deferReply();
        
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
    
    command.run(client, null, interaction)
  }

  if(interaction.isContextMenu()) {
    const command = client.commands.get(interaction.commandName);
    if(command) {
      command.run(client, null, interaction)
    }
  }
}