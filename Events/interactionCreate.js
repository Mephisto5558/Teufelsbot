const { EmbedBuilder, Colors, InteractionType, PermissionFlagsBits, ApplicationCommandOptionType } = require('discord.js');

module.exports = async (client, interaction) => {
  const command = client.slashCommands.get(interaction.commandName);
  if (!command || !interaction.isRepliable()) return;

  let guildLang = client.db.get('guildSettings')[interaction.guild.id]?.config?.lang || interaction.guild.preferredLocale.slice(0, 2);
  if(!client.lang.locales.includes(guildLang)) guildLang = client.lang.default_locale;
  const langData = client.lang.getLocale(guildLang);
  
  const lang = (message, ...args) => {
    let data;
    if(Object.keys(client.lang.messages[client.lang.default_locale]).includes(message.split('.')[0])) data = langData(message);
    else data = langData(`commands.${command.category.toLowerCase()}.${command.name.toLowerCase()}.${message}`, ...args);
    
    if (data !== undefined) return data;

    if(Object.keys(client.lang.messages[client.lang.default_locale]).includes(message.split('.')[0])) data = client.defaultLangData(message);
    else data = client.defaultLangData(`commands.${command.category.toLowerCase()}.${command.name.toLowerCase()}.${message}`, ...args);
    
    if (data !== undefined) return data;
    return 'NO_TEXT_FOUND';
  }

  const cooldown = await require('../Functions/private/cooldowns.js')(client, interaction, command);
  if (cooldown) return interaction.reply(lang('events.cooldown', cooldown));

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
        title: lang('events.permissionDenied.embedTitle'),
        color: Colors.Red,
        description: lang('events.permissionDenied.embedDescription', userPerms.length ? lang('global.you') : lang('global.i'), (botPerms.length ? botPerms : userPerms).join('`, `'))
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (!command.noDefer && !interaction.replied) await interaction.deferReply({ ephemeral: command.ephemeralDefer || false });

    for (const entry of interaction.options._hoistedOptions)
      if (entry.type == ApplicationCommandOptionType.String) entry.value = entry.value.replace(/<@!/g, '<@');

    try { await command.run(interaction, lang, client) }
    catch(err) { require('../Functions/private/error_handler.js')(err, client, interaction, lang) }
  }
}