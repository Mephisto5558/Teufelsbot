const { MessageEmbed } = require('discord.js');
const { colors } = require('../Settings/embed.json');

module.exports = async (client, interaction) => {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  const cooldown = await require('../Functions/private/cooldowns.js')(client, interaction.user, command);
  if(cooldown) return interaction.reply(`This command is on cooldown! Try again in \`${cooldown}\`s.`);

  const blacklist = client.db.get('blacklist');
  if (
    blacklist?.includes(interaction.user.id) ||
    (command.category.toLowerCase() == 'owner-only' && interaction.user.id != client.api.application.owner.id)  //DO NOT REMOVE THIS LINE!
  ) return;

  if (interaction.isCommand()) {
    const userPerms = interaction.member.permissionsIn(interaction.channel).missing([...command.permissions.user, 'SEND_MESSAGES']);
    const botPerms = interaction.guild.me.permissionsIn(interaction.channel).missing([...command.permissions.client, 'SEND_MESSAGES']);

    const embed = new MessageEmbed({
      title: 'Insufficient Permissions',
      color: colors.discord.RED,
      description:
        `${userPerms.length ? 'You' : 'I'} need the following permissions in this channel to run this command:\n\`` +
        (botPerms.length ? botPerms : userPerms).join('`, `') + '`'
    });

    if (botPerms.length || userPerms.length) return interaction.reply({ embeds: [embed], ephemeral: true });
    if (!command.noDefer && !interaction.replied) await interaction.deferReply({ ephemeral: command.ephemeralDefer || false });

    for (const entry of interaction.options._hoistedOptions) {
      if (entry.type == 'STRING') entry.value = entry.value.replace(/<@!/g, '<@')
    }

    client.interaction = interaction;
    await command.run(client, null, interaction);
    return client.interaction = null;
  }
}