/* eslint camelcase: [error, { allow: [_] }] -- This casing is used to better display the commandName. */

import type { Command, CommandType } from '@mephisto5558/command';

export {
  ban_kick_mute,
  lock_unlock,
  setupMinigameChannel
};

type SlashCommand = Command<['slash']>['run'];
type mixedCommand = Command<CommandType[]>['run'];

declare function ban_kick_mute(
  this: ThisParameterType<NonNullable<SlashCommand>>, ...args: Parameters<NonNullable<SlashCommand>>
): ReturnType<NonNullable<SlashCommand>>;
declare function lock_unlock(
  this: ThisParameterType<NonNullable<mixedCommand>>, ...args: Parameters<NonNullable<mixedCommand>>
): ReturnType<NonNullable<mixedCommand>>;
declare function setupMinigameChannel(
  this: ThisParameterType<NonNullable<mixedCommand>>, ...args: Parameters<NonNullable<mixedCommand>>
): ReturnType<NonNullable<mixedCommand>>;