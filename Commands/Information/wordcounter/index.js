const { Command, CommandType } = require('@mephisto5558/command');

module.exports = new Command({
  types: [CommandType.Slash],
  dmPermission: true,
  options: [
    require('./guild'),
    require('./channel'),
    require('./user')
  ],

  run() { /* Handled by the individual subcommands. */ }
});