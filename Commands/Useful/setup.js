module.exports = {
  name: 'setup',
  aliases: { prefix: ['config'], slash: ['config'] },
  description: 'Configure features of the bot.',
  usage: '',
  permissions: { client: [], user: ['ManageGuild'] },
  cooldowns: { guild: 0, user: 10000 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  beta: true,
  options: [
    {
      name: 'sync',
      description: 'force syncs my slash commands with your guild',
      type: 'Subcommand'
    },
    {
      name: 'toggle_module',
      description: 'toggles a module',
      type: 'Subcommand',
      options: [{
        name: 'module',
        description: 'the module you want to toggle',
        type: 'String',
        required: true,
        choices: [
          { name: 'gatekeeper', value: 'gatekeeper' },
          { name: 'birthday', value: 'birthday' }
        ]
      }]
    }
  ],

  run: async (interaction, lang, client) => {
    switch (interaction.options.getSubcommand()) {
      case 'sync': {
        await require('../../Handlers/slash_command_handler.js')(client, interaction.guild.id);

        return interaction.editReply(lang('finishedSync'));
      }

      case 'toggle_module': {
        const
          module = interaction.options.getString('module'),
          oldData = client.db.get('guildSettings'),
          setting = oldData[interaction.guild.id]?.[module]?.enable,
          newData = oldData.fMerge({ [interaction.guild.id]: { [module]: { enable: !setting } } });

        client.db.set('guildSettings', newData);
        return interaction.editReply(lang('toggledModule', module, setting ? lang('global.disabled') : lang('global.enabled')));
      }
    }

  }
}