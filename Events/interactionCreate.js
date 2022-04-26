const { MessageEmbed } = require("discord.js");
var embed = require("../Settings/embed.json");

module.exports = async (client, interaction) => {
  interaction.args = [];
  let sendMessagePerm;

  if(interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);
    if(!command) return;
    command.permissions.user.push('SEND_MESSAGES');
    command.permissions.client.push('SEND_MESSAGES');
    
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

    let embed = new MessageEmbed()
      .setTitle('Insufficient Permissions')
      .setDescription(`You need the following permissions to run this command:\n${command.permissions.user.toString().replace(',', ', ')}`)
      .setColor(embed.embed_wrongcolor);
    
    if (!interaction.member.permissions.has(command.permissions.user)) {
     return interaction.followUp({embeds: [embed], ephemeral: true});
    };
    
    if (!interaction.guild.me.permission.has(command.permissions.client)) {
      embed.setDescription(`I need the following permissions to run this command:\n${command.permissions.client.toString().replace(',', ', ')}`);
      return interaction.followUp({embeds: [embed], ephemeral: true});
    };
    
    command.run(client, null, interaction)
  }

  if(interaction.isContextMenu()) {
    const command = client.commands.get(interaction.commandName);
    if(command) {
      command.run(client, null, interaction)
    }
  }
}