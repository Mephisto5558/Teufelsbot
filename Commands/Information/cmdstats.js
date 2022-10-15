const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'cmdstats',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'command',
    type: 'String',
    autocomplete: true,
    autocompleteOptions: function () { return [...new Set([...this.prefixCommands.keys(), ...this.slashCommands.keys()])]; }
  }], beta: true,

  run: function (lang) {
    const
      command = this.options?.getString('command') || this.args?.[0],
      stats = this.client.db.get('botSettings').stats || {},
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        color: Colors.White
      });

    if (command) {
      const id = this.client.application.commands.cache.find(e => e.name == k)?.id;
      embed.data.description = lang('embedDescriptionOne', { command: id ? `</${command}:id>` : `\`${command}\``, count: stats[command] ?? 0 });
    }
    else {
      embed.data.description = lang('embedDescriptionMany') + Object.entries(stats)
        .sort(([, a], [, b]) => b - a).slice(0, 10).map(([k, v]) => {
          const id = this.client.application.commands.cache.find(e => e.name == k)?.id;
          return (id ? `</${k}:${id}>` : `\`${k}\``) + `: ${v}`;
        }).join('\n');
    }

    this.customReply({ embeds: [embed] });
  }
};