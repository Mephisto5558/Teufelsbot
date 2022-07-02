const { MessageEmbed } = require('discord.js');
const { colors } = require('../Settings/embed.json');

module.exports = async (client, interaction) => {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  const blacklist = client.db.get('blacklist');
  if (
    blacklist?.includes(interaction.user.id) || 
    (command.category.toLowerCase() == 'owner-only' && message.author.id != client.owner)  //DO NOT REMOVE THIS LINE!
  ) return;

  if (interaction.isCommand()) {
    const userPerms = interaction.member.permissionsIn(interaction.channel).missing([...command.permissions.user, 'SEND_MESSAGES']);
    const botPerms = interaction.guild.me.permissionsIn(interaction.channel).missing([...command.permissions.client, 'SEND_MESSAGES']);

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
}