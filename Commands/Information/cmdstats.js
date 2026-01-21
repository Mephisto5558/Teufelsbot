const
  { Colors, EmbedBuilder, TimestampStyles, bold, inlineCode } = require('discord.js'),
  { Command, commandTypes } = require('@mephisto5558/command'),
  { timeFormatter: { msInSecond }, commandMention, timeFormatter: { timestamp } } = require('#Utils');

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  usage: { examples: 'user joke' },
  cooldowns: { user: msInSecond },
  dmPermission: true,
  options: [
    {
      name: 'scope',
      type: 'String',
      choices: ['bot', 'guild', 'user']
    },
    {
      name: 'command',
      type: 'String',
      autocompleteOptions() { return [...this.client.prefixCommands.keys(), ...this.client.slashCommands.keys()].unique(); },
      strictAutocomplete: true
    }
  ],

  async run(lang) {
    const
      scope = this.options?.getString('scope') ?? this.args?.[0]?.toLowerCase() ?? 'bot',
      query = (this.options?.getString('command') ?? this.args?.[this.args.length == 1 ? 0 : 1])?.toLowerCase(),

      /** @type {Database['botSettings']['cmdStats']} */
      cmdStats = (scope == 'guild' || scope == 'user' ? this[scope].db.cmdStats : this.client.settings.cmdStats) ?? {};

    let target;
    if (scope == 'guild') target = this.guild.name;
    else if (scope == 'user') target = this.user.displayName;
    else target = this.client.user.displayName;

    const embed = new EmbedBuilder({ title: lang('embedTitle', target), color: Colors.White });

    if (query && query != scope) {
      let command = this.client.slashCommands.get(query) ?? this.client.prefixCommands.get(query);
      if (command?.aliasOf) command = this.client.slashCommands.get(command.aliasOf) ?? this.client.prefixCommands.get(command.aliasOf);

      if (!command) return this.customReply({ embeds: [embed.setDescription(lang('notFound')).setColor(Colors.Red)] });

      const total = bold(
        Object.values(cmdStats[command.name] ?? {}).reduce((/** @type {number} */ acc, e) => typeof e == 'number' ? acc + e : acc, 0)
      );
      embed.data.description = lang('embedDescriptionOne', {
        total, command: 'id' in command ? commandMention(command.name, command.id) : inlineCode(command.name),
        slash: bold(cmdStats[command.name]?.slash ?? 0), prefix: bold(cmdStats[command.name]?.prefix ?? 0)
      });

      if (cmdStats[command.name]?.createdAt)
        embed.data.description += `\n${lang('createdAtOne', timestamp(cmdStats[command.name].createdAt, TimestampStyles.ShortDate))}`;
    }
    else {
      embed.data.description = lang('embedDescriptionMany');
      embed.data.fields = Object.entries(cmdStats)
        .filter(([k]) => !this.client.config.devOnlyFolders.includes(
          (this.client.prefixCommands.get(k) ?? this.client.slashCommands.get(k))?.category
        ))
        .map(([k, v]) => [k, {
          total: Object.values(v).reduce((/** @type {number} */ acc, e) => typeof e == 'number' ? acc + e : acc, 0),
          slash: bold(v.slash ?? 0), prefix: bold(v.prefix ?? 0), createdAt: v.createdAt
        }])
        .toSorted(([, a], [, b]) => b.total - a.total)
        .slice(0, 10)
        .map((/** @type {[string, { total: string, slash: string, prefix: string, createdAt: Date | undefined }]} */ [k, v]) => {
          const
            id = this.client.application.commands.cache.find(e => e.name == k)?.id,
            field = { name: id ? commandMention(k, id) : `/${k}`, value: lang('embedFieldValue', { ...v, total: bold(v.total) }), inline: true };

          if (v.createdAt) field.value += `\n${lang('createdAtMany', timestamp(v.createdAt, TimestampStyles.ShortDate))}`;
          return field;
        });
    }

    return this.customReply({ embeds: [embed] });
  }
});