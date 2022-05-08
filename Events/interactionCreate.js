const { MessageEmbed } = require('discord.js');
const embedConfig = require("../Settings/embed.json");

module.exports = async(client, interaction) => {
  interaction.args = [];
  client.interaction = interaction;

  if (interaction.isCommand()) {
    
    let command = client.commands.get(interaction.commandName);
    if (!command) {
      command = client.slashCommands.get(interaction.commandName);
      if(!command) return;
    }
    await interaction.deferReply();
    
    command.permissions.user.push('SEND_MESSAGES');
    command.permissions.client.push('SEND_MESSAGES');

    for (let option of interaction.options.data) {
      if (option.type === "SUB_COMMAND") {
        if (option.name) interaction.args.push(option.name);
        if (option.options) option.options.forEach(x => {
          if (x.value) interaction.args.push(x.value);
        });
      } else if (option.value) interaction.args.push(option.value);
    }

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
    if (command) 
      (command.run(client, null, interaction)).then(client.interaction = null);
  }
  if (interaction.isButton()) interaction.deferUpdate();
}