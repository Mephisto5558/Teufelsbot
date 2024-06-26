const { validateConfig, setDefaultConfig } = require('./configValidator.js');

module.exports = {
  autocompleteGenerator: require('./autocompleteGenerator.js'),
  BackupSystem: require('./backupSystem.js'),
  checkForErrors: require('./checkForErrors.js'),
  checkTargetManageable: require('./checkTargetManageable.js'),
  commandExecutionWrapper: require('./commandExecutionWrapper.js'),
  componentHandler: require('./componentHandler.js'),
  validateConfig,
  cooldowns: require('./cooldowns.js'),

  /** @type {Record<string, number>}*/
  DiscordAPIErrorCodes: require('./DiscordAPIErrorCodes.json'),
  errorHandler: require('./errorHandler.js'),
  findAllEntries: require('./findAllEntries.js'),
  formatSlashCommand: require('./formatSlashCommand.js'),
  getAge: require('./getAge.js'),
  getCommands: require('./getCommands.js'),
  getDirectories: require('./getDirectories.js'),
  getTargetChannel: require('./getTargetChannel.js'),
  getTargetMember: require('./getTargetMember.js'),
  getTargetRole: require('./getTargetRole.js'),
  gitpull: require('./gitpull.js'),
  GiveawaysManager: require('./giveawaysManager.js'),
  localizeUsage: require('./localizeUsage.js'),
  logSayCommandUse: require('./logSayCommandUse.js'),
  setDefaultConfig,
  slashCommandsEqual: require('./slashCommandsEqual.js'),
  permissionTranslator: require('./permissionTranslator.js'),
  timeFormatter: require('./timeFormatter.js'),
  timeValidator: require('./timeValidator.js')
};