const { MessageEmbed } = require('discord.js');
const embedConfig = require("../Settings/embed.json");

module.exports = async(client, interaction) => {
  client.interaction = interaction;
  
  command = client.slashCommands.get(interaction.commandName);
  if(!command) return;

  if (interaction.isCommand()) {
    await interaction.deferReply();
    
    command.permissions.user.push('SEND_MESSAGES');
    command.permissions.client.push('SEND_MESSAGES');

    let embed = new MessageEmbed()
      .setTitle('Insufficient Permissions')
      .setColor(embedConfig.color_red);

    if (!interaction.member.permissions.has(command.permissions.user)) {
      embed.setDescription(`You need the following permissions to run this command:\n` +
        command.permissions.user.toString().replace(',', ', ')
      )
      return interaction.followUp({ embeds: [embed], ephemeral: true });
    };

    if (!interaction.guild.me.permissions.has(command.permissions.client)) {
      embed.setDescription(`I need the following permissions to run this command:\n` +
        command.permissions.client.toString().replace(',', ', ')
      );
      return interaction.followUp({ embeds: [embed], ephemeral: true });
    };

    (command.run(client, null, interaction)).then(client.interaction = null);
  }

  if (interaction.isContextMenu()) {
    const command = client.commands.get(interaction.commandName);
    if (command) command.run(client, null, interaction)
  }
  
  if (interaction.isButton() && !command.noDefer) interaction.deferUpdate();
}