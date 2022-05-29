const { MessageEmbed } = require('discord.js');
const embedConfig = require("../Settings/embed.json").colors;

module.exports = async(client, interaction) => {
  command = client.slashCommands.get(interaction.commandName);
  if(!command) return;

  if (interaction.isCommand()) {
    if(!command.noDefer)
    
    command.permissions.user.push('SEND_MESSAGES');
    command.permissions.client.push('SEND_MESSAGES');

    let embed = new MessageEmbed()
      .setTitle('Insufficient Permissions')
      .setColor(embedConfig.discord.RED);

    if (!interaction.member.permissions.has(command.permissions.user)) {
      embed.setDescription(`You need the following permissions to run this command:\n` +
        command.permissions.user.toString().replace(',', ', ')
      )
    };

    if (!interaction.guild.me.permissions.has(command.permissions.client)) {
      embed.setDescription(`I need the following permissions to run this command:\n` +
        command.permissions.client.toString().replace(',', ', ')
      );
    };

    if(embed.description) return interaction.reply({ embeds: [embed], ephemeral: true });
    await interaction.deferReply();
    
    client.interaction = interaction;
    return (command.run(client, null, interaction)).then(client.interaction = null);
  }

  if (interaction.isContextMenu()) {
    const command = client.commands.get(interaction.commandName);
    if (command) command.run(client, null, interaction)
  }
  
  if (interaction.isButton() && !command.noDefer) interaction.deferUpdate();
}