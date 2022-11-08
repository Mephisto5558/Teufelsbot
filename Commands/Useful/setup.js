module.exports = {
  name: 'setup',
  aliases: { prefix: ['config'], slash: ['config'] },
  permissions: { user: ['ManageGuild'] },
  cooldowns: { user: 1e4 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  beta: true,
  options: [
    { name: 'sync', type: 'Subcommand' },
    {
      name: 'toggle_module',
      type: 'Subcommand',
      options: [{
        name: 'module',
        type: 'String',
        required: true,
        choices: ['gatekeeper', 'birthday']
      }]
    }
  ],

  run: async function (lang, client) {
    switch (this.options.getSubcommand()) {
      case 'sync': {
        await require('../../Handlers/slash_command_handler.js').call(client, this.guild.id);

        return this.editReply(lang('finishedSync'));
      }

      case 'toggle_module': {
        const
          module = this.options.getString('module'),
          setting = client.db.get('guildSettings')[this.guild.id]?.[module]?.enable;

        client.db.update('guildSettings', `${this.guild.id}.${module}.enable`, !setting);
        return this.editReply(lang('toggledModule', { name: module, state: setting ? lang('global.disabled') : lang('global.enabled') }));
      }
    }

  }
};