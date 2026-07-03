export default {
  afk: require('./afk'),
  BackupSystem: require('./backupSystem'),
  checkTargetManageable: require('./checkTargetManageable'),
  commandPermissionCheck: require('./commandPermissionCheck'),
  componentHandler: require('./componentHandler'),
  configValidator: require('./configValidator'),
  constants: require('./constants'),
  convertToMedal: require('./convertToMedal'),
  DiscordAPIErrorCodes: require('./DiscordAPIErrorCodes.json'),
  errorHandler: require('./errorHandler'),
  filterEmptyEntries: require('./filterEmptyEntries'),
  findAllEntries: require('./findAllEntries'),
  findPaths: require('./findPaths'),
  getAge: require('./getAge'),
  getConfig: require('./getConfig'),
  getTargetMembers: require('./getTargetMembers'),
  getTargetRole: require('./getTargetRole'),
  gitpull: require('./gitpull'),
  GiveawaysManager: require('./giveawaysManager'),
  logSayCommandUse: require('./logSayCommandUse'),
  permissionTranslator: require('./permissionTranslator'),
  seededHash: require('./seededHash'),
  shellExec: require('./shellExec'),
  prototypeRegisterer: require('./prototypeRegisterer'),
  sleep: require('./sleep'),
  timeFormatter: require('./timeFormatter'),
  timeValidator: require('./timeValidator'),
  toMs: require('./toMs'),
  updateCommandStats: require('./updateCommandStats')
};

export namespace getTargetUtils {
  export type Param = { targetOptionName?: string; returnSelf?: boolean };
  export type MaybeWithUndefined<X, T extends boolean> = T extends true ? X : X | undefined;
  export type ShouldReturnSelf<T> = [T] extends [{ returnSelf: true }] ? true : false;
}