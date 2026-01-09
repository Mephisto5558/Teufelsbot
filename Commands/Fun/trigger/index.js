const { Command } = require('@mephisto5558/command');

module.exports = new Command({
  types: ['slash'],
  permissions: { user: ['ManageMessages'] },
  options: [
    require('./add'),
    require('./edit'),
    require('./delete'),
    require('./clear'),
    require('./get')
  ],

  run() {
    const
      oldData = this.guild.db.triggers ?? [],
      query = this.options.getString('query_or_id')?.toLowerCase();

    return { oldData, query };
  }
});