/* eslint camelcase: [error, { allow: [_] }] -- This casing is used to better display the commandName. */


export {
  ban_kick_mute,
  lock_unlock,
  setupMinigameChannel
};

type slashCommand = command<'slash', true, true>['run'];
type mixedCommand = command<'both', true, true>['run'];

declare function ban_kick_mute(
  this: ThisParameterType<NonNullable<slashCommand>>, ...args: Parameters<NonNullable<slashCommand>>
): ReturnType<NonNullable<slashCommand>>;
declare function lock_unlock(
  this: ThisParameterType<NonNullable<mixedCommand>>, ...args: Parameters<NonNullable<mixedCommand>>
): ReturnType<NonNullable<mixedCommand>>;
declare function setupMinigameChannel(
  this: ThisParameterType<NonNullable<mixedCommand>>, ...args: Parameters<NonNullable<mixedCommand>>
): ReturnType<NonNullable<mixedCommand>>;