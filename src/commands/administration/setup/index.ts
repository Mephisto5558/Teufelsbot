const { Command, CommandType, CooldownType, Permission, PermissionType } = require('@mephisto5558/command');

module.exports = new Command({
  types: [CommandType.Slash],
  aliases: { [CommandType.Slash]: ['config'] },
  permissions: { [PermissionType.User]: [Permission.ManageGuild] },
  cooldowns: { [CooldownType.User]: '10s' },
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