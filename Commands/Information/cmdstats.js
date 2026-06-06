const
  { Colors, EmbedBuilder, TimestampStyles, bold } = require('discord.js'),
  { AllContexts, Command, CommandType, CooldownType, OptionType } = require('@mephisto5558/command'),
  { timestamp } = require('#Utils').timeFormatter;

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  usage: { examples: 'user joke' },
  cooldowns: { [CooldownType.User]: '1s' },
  contexts: AllContexts,
  options: [
    {
      name: 'scope',
      type: OptionType.String,
      choices: ['bot', 'guild', 'user']
    },
    {
      name: 'command',
      type: OptionType.String,
      autocompleteOptions() { return this.client.commandManager.commands.keys(); },
      strictAutocomplete: true
    }
  ],

  async run(lang) {
    const
      scope = this.options?.getString('scope') ?? this.args?.[0]?.toLowerCase() ?? 'bot',
      query = (this.options?.getString('command') ?? this.args?.[this.args.length == 1 ? 0 : 1])?.toLowerCase(),
      cmdStats = (scope == 'guild' || scope == 'user' ? this[scope].db.cmdStats : this.client.settings.cmdStats) ?? {};

    let target;
    if (scope == 'guild') target = this.guild.name;
    else if (scope == 'user') target = this.user.displayName;
    else target = this.client.user.displayName;

    const embed = new EmbedBuilder({ title: lang('embedTitle', target), color: Colors.White });

    if (query && query != scope) {
      const command = this.client.commandManager.get(query);
      if (!command) return this.customReply({ embeds: [embed.setDescription(lang('notFound')).setColor(Colors.Red)] });

      const total = bold(
        Object.values(cmdStats[command.name] ?? {})
          .reduce((/** @type {number} */ acc, /** @type {number} */ e) => typeof e == 'number' ? acc + e : acc, 0)
      );
      embed.data.description = lang('embedDescriptionOne', {
        total, command: command.mention(),
        slash: bold(cmdStats[command.name]?.slash ?? 0), prefix: bold(cmdStats[command.name]?.prefix ?? 0)
      });

      if (!cmdStats[command.name]?.createdAt.getTime()) // filter out old commands with unknown creation date
        embed.data.description += `\n${lang('createdAtOne', timestamp(cmdStats[command.name].createdAt, TimestampStyles.ShortDate))}`;
    }
    else {
      embed.data.description = lang('embedDescriptionMany');
      embed.data.fields = Object.entries(cmdStats)
        .filter(([k]) => !this.client.config.devOnlyFolders.includes(this.client.commandManager.get(k)?.category))
        .map(([k, v]) => [k, {
          total: bold(Object.values(v).reduce((/** @type {number} */ acc, e) => typeof e == 'number' ? acc + e : acc, 0)),
          ...Object.fromEntries(Object.values(CommandType).map(e => [e, bold(v[e] ?? 0)])),
          createdAt: v.createdAt
        }])
        .toSorted(([, a], [, b]) => b.total - a.total)
        .slice(0, 10)
        .map(([k, v]) => {
          if (typeof k != 'string' || typeof v != 'object') throw new TypeError('Unexpected typeguard triggered');

          const
            command = this.client.commandManager.get(k),
            field = { name: command?.mention() ?? `/${k}`, value: lang('embedFieldValue', v), inline: true };

          if (v.createdAt.getTime()) field.value += `\n${lang('createdAtMany', timestamp(v.createdAt, TimestampStyles.ShortDate))}`;
          return field;
        });
    }

    return this.customReply({ embeds: [embed] });
  }
});