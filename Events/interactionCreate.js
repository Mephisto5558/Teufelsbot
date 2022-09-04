const
  { EmbedBuilder, Colors, InteractionType, ApplicationCommandOptionType } = require('discord.js'),
  I18nProvider = require('../Functions/private/I18nProvider.js');

module.exports = async (client, interaction) => {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command || !interaction.isRepliable()) return;

  const lang = I18nProvider.__.bind(I18nProvider, { locale: client.db.get('guildSettings')[interaction.guild.id]?.config?.lang || interaction.guild.preferredLocale.slice(0, 2), backUpPath: `commands.${command.category.toLowerCase()}.${command.name}` });

  const cooldown = await require('../Functions/private/cooldowns.js')(client, interaction, command);
  if (cooldown) return interaction.reply({ content: lang('events.cooldown', cooldown), ephemeral: true });

  const { blacklist } = client.db.get('botSettings');
  if (
    blacklist?.includes(interaction.user.id) ||
    (command.category.toLowerCase() == 'owner-only' && interaction.user.id != client.application.owner.id)  //DO NOT REMOVE THIS STATEMENT!
  ) return;

  if (command.requireEconomy) {
    if (!economy?.enable) return interaction.reply({ content: lang('events.economyDisabled'), ephemeral: true });
    if (!economy?.[interaction.user.id]?.gaining?.chat) return interaction.reply({ content: lang('events.economyNotInitialized'), ephemeral: true });
  }

  if (interaction.type == InteractionType.ApplicationCommand) {
    const userPermsMissing = interaction.member.permissionsIn(interaction.channel).missing(command.permissions.user);
    const botPermsMissing = interaction.guild.members.me.permissionsIn(interaction.channel).missing(command.permissions.client);

    if (botPermsMissing.length || userPermsMissing.length) {
      const embed = new EmbedBuilder({
        title: lang('events.permissionDenied.embedTitle'),
        color: Colors.Red,
        description: lang('events.permissionDenied.embedDescription', { IYou: userPermsMissing.length ? lang('global.you') : lang('global.i'), permissions: (botPermsMissing.length ? botPermsMissing : userPermsMissing).join('`, `') })
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (!command.noDefer && !interaction.replied) await interaction.deferReply({ ephemeral: command.ephemeralDefer ?? false });

    for (const entry of interaction.options._hoistedOptions)
      if (entry.type == ApplicationCommandOptionType.String) entry.value = entry.value.replaceAll('<@!', '<@');

    try { await command.run(interaction, lang, client) }
    catch (err) { require('../Functions/private/error_handler.js')(err, client, interaction, lang) }
  }
}