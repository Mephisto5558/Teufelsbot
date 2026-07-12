import { Command, CommandType, Permission, PermissionType } from '@mephisto5558/command';

export default new Command({
  types: [CommandType.Slash],
  permissions: { [PermissionType.User]: [Permission.ManageMessages] },
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