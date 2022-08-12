const { EmbedBuilder, Colors, InteractionType, PermissionFlagsBits, ApplicationCommandOptionType } = require('discord.js');

module.exports = async (client, interaction) => {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command || !interaction.isRepliable()) return;

  const cooldown = await require('../Functions/private/cooldowns.js')(client, interaction, command);
  if (cooldown) return interaction.reply(client.lang('events.cooldown', cooldown));

  const { blacklist } = client.db.get('botSettings');
  if (
    blacklist?.includes(interaction.user.id) ||
    (command.category.toLowerCase() == 'owner-only' && interaction.user.id != client.application.owner.id)  //DO NOT REMOVE THIS LINE!
  ) return;

  if (interaction.type === InteractionType.ApplicationCommand) {
    const userPerms = interaction.member.permissionsIn(interaction.channel).missing([...command.permissions.user, PermissionFlagsBits.SendMessages]);
    const botPerms = interaction.guild.members.me.permissionsIn(interaction.channel).missing([...command.permissions.client, PermissionFlagsBits.SendMessages]);

    if (botPerms.length || userPerms.length) {
      const embed = new EmbedBuilder({
        title: client.lang('events.permissionDenied.embedTitle'),
        color: Colors.Red,
        description: client.lang('events.permissionDenied.embedDescription', userPerms.length ? client.lang('global.you') : client.lang('global.i'), (botPerms.length ? botPerms : userPerms).join('`, `'))
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const languageData = client.lang.getLocale(client.db.get('guildSettings')[interaction.guild.id]?.config?.lang || interaction.guild.preferredLocale);
    const lang = (message, ...args) => {
      let data = languageData(message?.startsWith('global.') ? message : `commands.${command.category.toLowerCase()}.${command.name.toLowerCase()}.${message}`, ...args);
      if (data !== undefined) return data;

      data = client.lang.getLocale(client.db.get('guildSettings').default.config.lang)(message?.startsWith('global.') ? interaction : `commands.${command.category.toLowerCase()}.${command.name.toLowerCase()}.${message}`, ...args);
      if (data !== undefined) return data;
      return 'NO_TEXT_FOUND';
    }

    if (!command.noDefer && !interaction.replied) await interaction.deferReply({ ephemeral: command.ephemeralDefer || false });

    for (const entry of interaction.options._hoistedOptions)
      if (entry.type == ApplicationCommandOptionType.String) entry.value = entry.value.replace(/<@!/g, '<@');

    command.run(interaction, lang, client)
      .catch(err => { require('../Functions/private/error_handler.js')(err, client, interaction, lang) });
  }
}