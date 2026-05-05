const { Command, CommandType, DMPermType } = require('@mephisto5558/command');

module.exports = new Command({
  types: [CommandType.Slash],
  dmPermission: DMPermType.CanBeDM,
  options: [
    require('./guild'),
    require('./channel'),
    require('./user')
  ],

  run() { /* Handled by the individual subcommands. */ }
});