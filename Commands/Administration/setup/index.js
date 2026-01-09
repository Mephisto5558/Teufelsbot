const
  { Command } = require('@mephisto5558/command'),
  { timeFormatter: { msInSecond } } = require('#Utils');

module.exports = new Command({
  types: ['slash'],
  aliases: { slash: ['config'] },
  permissions: { user: ['ManageGuild'] },
  cooldowns: { user: msInSecond * 10 },
  options: [
    require('./toggle_command'),
    require('./language'),
    require('./set_prefix'),
    require('./add_prefix'),
    require('./remove_prefix'),
    require('./serverbackup'),
    require('./autopublish'),
    require('./logger'),
    require('./birthday'),
    require('./wordcounter')
  ],

  run() { /* Handled by the individual subcommands. */ }
});