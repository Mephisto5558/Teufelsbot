const { EmbedBuilder, Colors } = require('discord.js');

/** @type {command<'both', false>}*/
module.exports = {
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'mode',
    type: 'Subcommand',
    choices: ['bot', 'guild', 'user'],
    options: [{
      name: 'command',
      type: 'String',
      autocompleteOptions: function () { return [...new Set([...this.client.prefixCommands.keys(), ...this.client.slashCommands.keys()])]; },
      strictAutocomplete: true
    }]
  }],

  run: function (lang) {
    const
      mode = this.options?.getSubcommand(true) ?? this.args?.[0]?.toLowerCase() ?? 'bot',
      query = (this.options?.getString('command') ?? this.args?.[1])?.toLowerCase(),
      cmdStats = (mode == 'guild' || mode == 'user' ? this[mode].db.cmdStats : this.client.settings.cmdStats) ?? {};

    let target;
    if (mode == 'guild') target = this.guild.name;
    else if (mode == 'user') target = this.user.displayName;
    else target = this.client.user.displayName;

    const embed = new EmbedBuilder({ title: lang('embedTitle', target), color: Colors.White });

    if (query) {
      let command = this.client.slashCommands.get(query) ?? this.client.prefixCommands.get(query);
      if (command?.aliasOf) command = this.client.slashCommands.get(command.aliasOf) || this.client.prefixCommands.get(command.aliasOf);

      const total = Object.values(cmdStats[command.name] ?? {}).reduce((acc, e) => acc + e, 0);

      embed.data.description = lang('embedDescriptionOne', {
        command: command?.id ? `</${command.name}:${command.id}>` : `\`${command.name}\``,
        total, slash: cmdStats[command.name]?.slash ?? 0, prefix: cmdStats[command.name]?.prefix ?? 0
      });
    }
    else {
      embed.data.description = lang('embedDescriptionMany');
      embed.data.fields = Object.entries(cmdStats)
        .filter(([k]) => !this.client.config.ownerOnlyFolders.includes((this.client.prefixCommands.get(k) ?? this.client.slashCommands.get(k))?.category))
        .map(([k, v = {}]) => [k, { total: Object.values(v).reduce((acc, e) => acc + e, 0) ?? 0, slash: v.slash ?? 0, prefix: v.prefix ?? 0 }])
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 10)
        .map(([k, v]) => {
          const id = this.client.application.commands.cache.find(e => e.name == k)?.id;
          return { name: id ? `</${k}:${id}>` : `/${k}`, value: lang('embedFieldValue', v), inline: true };
        });
    }

    return this.customReply({ embeds: [embed] });
  }
};