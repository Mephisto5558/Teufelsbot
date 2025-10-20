const { timeFormatter: { msInSecond } } = require('#Utils');

/** @type {command<'slash'>} */
module.exports = {
  aliases: { slash: ['config'] },
  permissions: { user: ['ManageGuild'] },
  cooldowns: { user: msInSecond * 10 },
  slashCommand: true,
  prefixCommand: false,
  options: [
    { name: 'toggle_command', type: 'Subcommand' },
    {
      name: 'language',
      type: 'Subcommand',
      cooldowns: { guild: msInSecond * 10 }
    },
    { name: 'set_prefix', type: 'Subcommand' },
    { name: 'add_prefix', type: 'Subcommand' },
    { name: 'remove_prefix', type: 'Subcommand' },
    { name: 'serverbackup', type: 'Subcommand' },
    { name: 'autopublish', type: 'Subcommand' },
    { name: 'logger', type: 'Subcommand' },
    { name: 'birthday', type: 'Subcommand' },
    { name: 'wordcounter', type: 'Subcommand' }
  ],

  run: undefined
};