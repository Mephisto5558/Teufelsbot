/* eslint camelcase: [error, { allow: [_] }] -- This casing is used to better display the commandName. */

import type { Command, CommandType } from '@mephisto5558/command';

type SlashCommand = Command<[CommandType.Slash]>['run'];
type mixedCommand = Command<CommandType[]>['run'];

export declare function ban_kick_mute(
  this: ThisParameterType<NonNullable<SlashCommand>>, ...args: Parameters<NonNullable<SlashCommand>>
): ReturnType<NonNullable<SlashCommand>>;
export declare function lock_unlock(
  this: ThisParameterType<NonNullable<mixedCommand>>, ...args: Parameters<NonNullable<mixedCommand>>
): ReturnType<NonNullable<mixedCommand>>;
export declare function setupMinigameChannel(
  this: ThisParameterType<NonNullable<mixedCommand>>, ...args: Parameters<NonNullable<mixedCommand>>
): ReturnType<NonNullable<mixedCommand>>;