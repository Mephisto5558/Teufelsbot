module.exports = {
  autocompleteGenerator: require('./autocompleteGenerator.js'),
  BackupSystem: require('./backupSystem.js'),
  checkForErrors: require('./checkForErrors.js'),
  checkTargetManageable: require('./checkTargetManageable.js'),
  commandExecutionWrapper: require('./commandExecutionWrapper.js'),
  componentHandler: require('./componentHandler.js'),
  cooldowns: require('./cooldowns.js'),
  errorHandler: require('./error_handler.js'),
  findAllEntries: require('./findAllEntries.js'),
  formatSlashCommand: require('./formatSlashCommand.js'),
  getAge: require('./getAge.js'),
  getOwnerOnlyFolders: require('./getOwnerOnlyFolders.js'),
  getTargetChannel: require('./getTargetChannel.js'),
  getTargetMember: require('./getTargetMember.js'),
  gitpull: require('./gitpull.js'),
  GiveawaysManager: require('./giveawaysManager.js'),
  logSayCommandUse: require('./logSayCommandUse.js'),
  slashCommandsEqual: require('./slashCommandsEqual.js'),
  permissionTranslator: require('./permissionTranslator.js'),
  timeFormatter: require('./timeFormatter.js'),
  timeValidator: require('./timeValidator.js'),
};