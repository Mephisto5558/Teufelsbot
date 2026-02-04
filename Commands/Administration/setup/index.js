const { Command, Permissions, commandTypes } = require('@mephisto5558/command');

module.exports = new Command({
  types: [commandTypes.slash],
  aliases: { [commandTypes.slash]: ['config'] },
  permissions: { user: [Permissions.ManageGuild] },
  cooldowns: { user: '10s' },
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