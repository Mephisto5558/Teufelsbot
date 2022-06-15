const { MessageEmbed } = require('discord.js');
const { colors } = require('../Settings/embed.json');

module.exports = async (client, interaction) => {

  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  const blacklist = client.blacklist || client.db.get('blacklist') || [];
  if (blacklist.includes(interaction.user.id)) return;

  if (command.category == 'Owner-Only') { //DO NOT REMOVE THIS BLOCK!
    const permissionGranted = await client.functions.checkBotOwner(client, message);
    if (!permissionGranted) return;
  }

  if (interaction.isCommand()) {
    command.permissions.user.push('SEND_MESSAGES');
    command.permissions.client.push('SEND_MESSAGES');

    const userPerms = interaction.member.permissionsIn(interaction.channel).missing(command.permissions.user);
    const botPerms = interaction.guild.me.permissionsIn(interaction.channel).missing(command.permissions.client);

    const embed = new MessageEmbed()
      .setTitle('Insufficient Permissions')
      .setColor(colors.discord.RED);

    if (userPerms.length) {
      embed.setDescription(
        `You need the following permissions in this channel to run this command:\n\`` +
        userPerms.join('`, `') + '`'
      )
    }
    else if (botPerms.length) {
      embed.setDescription(
        `I need the following permissions in this channel to run this command:\n\`` +
        botPerms.join('`, `') + '`'
      )
    }

    if (embed.description) return interaction.reply({ embeds: [embed], ephemeral: true });
    if (!command.noDefer && !interaction.replied) await interaction.deferReply({ ephemeral: command.ephemeralDefer || false });

    for(const entry of interaction.options._hoistedOptions) {
      if (entry.type == 'STRING') entry.value = entry.value.replace(/<@!/g, '<@')
    }

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