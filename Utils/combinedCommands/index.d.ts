/* eslint camelcase: [error, { allow: [_] }] -- This casing is used to better display the commandName. */


export {
  ban_kick_mute,
  lock_unlock,
  setupMinigameChannel
};

type slashCommand = command<'slash', true, true>['run'];
type mixedCommand = command<'both', true, true>['run'];

declare function ban_kick_mute(this: ThisParameterType<slashCommand>, ...args: Parameters<slashCommand>): ReturnType<slashCommand>;
declare function lock_unlock(this: ThisParameterType<mixedCommand>, ...args: Parameters<mixedCommand>): ReturnType<mixedCommand>;
declare function setupMinigameChannel(this: ThisParameterType<mixedCommand>, ...args: Parameters<mixedCommand>): ReturnType<mixedCommand>;