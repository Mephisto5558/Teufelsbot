const { EmbedBuilder, Colors, InteractionType, PermissionFlagsBits, ApplicationCommandOptionType } = require('discord.js');

module.exports = async (client, interaction) => {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command || !interaction.isRepliable()) return;

  const cooldown = await require('../Functions/private/cooldowns.js')(client, interaction, command);
  if (cooldown) return interaction.reply(`This command is on cooldown! Try again in \`${cooldown}\`s.`);

  const blacklist = client.db.get('blacklist');
  if (
    blacklist?.includes(interaction.user.id) ||
    (command.category.toLowerCase() == 'owner-only' && interaction.user.id != client.application.owner.id)  //DO NOT REMOVE THIS LINE!
  ) return;

  if (interaction.type === InteractionType.ApplicationCommand) {
    const userPerms = interaction.member.permissionsIn(interaction.channel).missing([...command.permissions.user, PermissionFlagsBits.SendMessages]);
    const botPerms = interaction.guild.members.me.permissionsIn(interaction.channel).missing([...command.permissions.client, PermissionFlagsBits.SendMessages]);

    if (botPerms.length || userPerms.length) {
      const embed = new EmbedBuilder({
        title: 'Insufficient Permissions',
        color: Colors.Red,
        description:
          `${userPerms.length ? 'You' : 'I'} need the following permissions in this channel to run this command:\n\`` +
          (botPerms.length ? botPerms : userPerms).join('`, `') + '`'
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (!command.noDefer && !interaction.replied) await interaction.deferReply({ ephemeral: command.ephemeralDefer || false });

    for (const entry of interaction.options._hoistedOptions)
      if (entry.type == ApplicationCommandOptionType.String) entry.value = entry.value.replace(/<@!/g, '<@');

    try { await command.run(client, null, interaction) }
    catch (err) {
      await require('../Functions/private/error_handler.js')(err, client, interaction);
    }
  }
}