const { Command } = require('@mephisto5558/command');

module.exports = new Command({
  types: ['slash'],
  dmPermission: true,
  options: [
    require('./guild'),
    require('./channel'),
    require('./user')
  ],

  run() { /* Handled by the individual subcommands. */ }
});