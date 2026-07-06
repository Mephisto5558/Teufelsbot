export * as afk from './afk.ts';
export { default as BackupSystem } from './backupSystem.ts';
export { default as checkTargetManageable } from './checkTargetManageable.ts';
export { default as commandPermissionCheck } from './commandPermissionCheck.ts';
export { default as componentHandler } from './componentHandler.ts';
export * as configValidator from './configValidator.ts';
export * as constants from './constants.ts';
export { default as convertToMedal } from './convertToMedal.ts';
export { default as DiscordAPIErrorCodes } from './DiscordAPIErrorCodes.json' with { type: 'json' };
export { default as errorHandler } from './errorHandler.ts';
export { default as filterEmptyEntries } from './filterEmptyEntries.ts';
export { default as findAllEntries } from './findAllEntries.ts';
export { default as findPaths } from './findPaths.ts';
export { default as getAge } from './getAge.ts';
export { default as getConfig } from './getConfig.ts';
export { default as getTargetMembers } from './getTargetMembers.ts';
export { default as getTargetRole } from './getTargetRole.ts';
export { default as gitpull } from './gitpull.ts';
export { default as GiveawaysManager } from './giveawaysManager.ts';
export { default as logSayCommandUse } from './logSayCommandUse.ts';
export { default as permissionTranslator } from './permissionTranslator.ts';
export { default as seededHash } from './seededHash.ts';
export { default as shellExec } from './shellExec.ts';
export * as prototypeRegisterer from './prototypeRegisterer/index.ts';
export { default as sleep } from './sleep.ts';
export * as timeFormatter from './timeFormatter.ts';
export { default as timeValidator } from './timeValidator.ts';
export * as toMs from './toMs.ts';
export { default as updateCommandStats } from './updateCommandStats.ts';

export namespace getTargetUtils {
  export type Param = { targetOptionName?: string; returnSelf?: boolean };
  export type MaybeWithUndefined<X, T extends boolean> = T extends true ? X : X | undefined;
  export type ShouldReturnSelf<T> = [T] extends [{ returnSelf: true }] ? true : false;
}