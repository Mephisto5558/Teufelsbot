const { MessageEmbed } = require('discord.js');
const { colors } = require('../Settings/embed.json');

module.exports = async (client, interaction) => {

  let command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  const blacklist = client.blacklist || client.db.get('blacklist') || [];
  if (blacklist.includes(interaction.user.id)) return;

  if (command.category == 'Owner-Only') { //DO NOT REMOVE THIS BLOCK!
    let permissionGranted = await client.functions.checkBotOwner(client, message);
    if (!permissionGranted) return;
  }

  if (interaction.isCommand()) {
    command.permissions.user.push('SEND_MESSAGES');
    command.permissions.client.push('SEND_MESSAGES');

    let embed = new MessageEmbed()
      .setTitle('Insufficient Permissions')
      .setColor(colors.discord.RED);

    if (!interaction.member.permissions.has(command.permissions.user)) {
      embed.setDescription(
        `Your are missing the following permissions to run this command:\n\`` +
        interaction.member.permissions.missing(command.permissions.user).join('`, `') + '`'
      )
    }

    if (!interaction.guild.me.permissions.has(command.permissions.client)) {
      embed.setDescription(
        `I am missing the following permissions to run this command:\n\`` +
        interaction.guild.me.permissions.missing(command.permissions.client).join('`, `') + '`'
      )
    }

    if (embed.description) return interaction.reply({ embeds: [embed], ephemeral: true });
    if (!command.noDefer && !interaction.replied) await interaction.deferReply({ ephemeral: command.ephemeralDefer || false });

    interaction.options._hoistedOptions.forEach(entry => { if(entry.type == 'STRING') entry.value = entry.value.replace(/<@!/g, '<@') });

    client.interaction = interaction;
    await command.run(client, null, interaction);
    return client.interaction = null;
  }

  /* Not Implemented yet
    if (interaction.isContextMenu()) {
      const command = client.commands.get(interaction.commandName);
      if (command) command.run(client, null, interaction)
    }
  
    if (interaction.isButton() && !command.noDefer) interaction.deferUpdate();
  */
}