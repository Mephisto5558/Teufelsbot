const
  { EmbedBuilder, Colors, InteractionType, ApplicationCommandOptionType } = require('discord.js'),
  I18nProvider = require('../Functions/private/I18nProvider.js');

module.exports = async function interactionCreate() {
  const command = this.client.slashCommands.get(this.commandName);
  const { blacklist, stats = {} } = this.client.db.get('botSettings');

  if (
    !command || blacklist?.includes(this.user.id) ||
    (command.category.toLowerCase() == 'owner-only' && this.user.id != this.client.application.owner.id)  //DO NOT REMOVE THIS STATEMENT!
  ) return;

  if (this.type == InteractionType.ApplicationCommandAutocomplete) {
    const
      lang = I18nProvider.__.bind(I18nProvider, { locale: this.client.db.get('guildSettings')[this.guild.id]?.config?.lang || this.guild.preferredLocale.slice(0, 2), backupPath: `commands.${command.category.toLowerCase()}.${command.name}`, undefinedNotFound: true }),
      focused = this.options.getFocused(true),
      response = v => ({ name: lang(`options.${this.options._group ? this.options._group + '.' : ''}${this.options._subcommand ? this.options._subcommand + '.' : ''}${focused.name}.choices.${v}`) ?? v, value: v });

    let { options } = command.fMerge();
    if (this.options._group) options = options.find(e => e.name == this.options._group);
    if (this.options._subcommand) options = options.find(e => e.name == this.options._subcommand).options;
    options = options.find(e => e.name == focused.name).autocompleteOptions;
    if (typeof options == 'function') options = await options.call(this);

    return this.respond(
      typeof options == 'string' ? [response(options)] : options
        .filter(e => e.toLowerCase().includes(focused.value.toLowerCase()))
        .slice(0, 25)
        .map(response)
    );
  }

  if (!this.isRepliable()) return;

  const lang = I18nProvider.__.bind(I18nProvider, { locale: this.client.db.get('guildSettings')[this.guild.id]?.config?.lang || this.guild.preferredLocale.slice(0, 2), backupPath: `commands.${command.category.toLowerCase()}.${command.name}` });

  const cooldown = await require('../Functions/private/cooldowns.js').call(this, command);
  if (cooldown) return this.reply({ content: lang('events.cooldown', cooldown), ephemeral: true });

  if (command.requireEconomy) {
    const economy = this.client.db.get('guildSettings')[this.guild.id]?.economy;
    if (!economy?.enable) return this.reply({ content: lang('events.economyDisabled'), ephemeral: true });
    if (!economy?.[this.user.id]?.gaining?.chat) return this.reply({ content: lang('events.economyNotInitialized'), ephemeral: true });
  }

  if (this.type == InteractionType.ApplicationCommand) {
    const userPermsMissing = this.member.permissionsIn(this.channel).missing(command.permissions.user);
    const botPermsMissing = this.guild.members.me.permissionsIn(this.channel).missing(command.permissions.client);

    if (botPermsMissing.length || userPermsMissing.length) {
      const embed = new EmbedBuilder({
        title: lang('events.permissionDenied.embedTitle'),
        color: Colors.Red,
        description: lang(`events.permissionDenied.embedDescription${userPermsMissing.length ? 'User' : 'Bot'}`, { permissions: (botPermsMissing.length ? botPermsMissing : userPermsMissing).join('`, `') })
      });

      return this.reply({ embeds: [embed], ephemeral: true });
    }

    if (!command.noDefer && !this.replied) await this.deferReply({ ephemeral: command.ephemeralDefer ?? false });

    for (const entry of this.options._hoistedOptions)
      if (entry.type == ApplicationCommandOptionType.String) entry.value = entry.value.replaceAll('<@!', '<@');

    try {
      command.run.call(this, lang, this.client)?.catch(err => require('../Functions/private/error_handler.js').call(this.client, err, this, lang));
      if (this.client.botType != 'dev') this.client.db.update('botSettings', `stats.${command.name}`, stats[command.name] + 1 || 1);
    } catch (err) { require('../Functions/private/error_handler.js').call(this.client, err, this, lang); }
  }
};