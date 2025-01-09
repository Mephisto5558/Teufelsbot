/** @type {command<'slash'>} */
module.exports = {
  permissions: { user: ['ManageMessages'] },
  slashCommand: true,
  prefixCommand: false,
  options: [
    { name: 'add', type: 'Subcommand' },
    { name: 'edit', type: 'Subcommand' },
    { name: 'delete', type: 'Subcommand' },
    { name: 'clear', type: 'Subcommand' },
    { name: 'get', type: 'Subcommand' }
  ],

  run() {
    const
      oldData = this.guild.db.triggers ?? [],
      query = this.options.getString('query_or_id')?.toLowerCase();

    return { oldData, query };
  }
};