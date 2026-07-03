/* eslint-disable @eslint-community/eslint-comments/no-use -- This casing is used to better display the commandName. */
/* eslint camelcase: [error, { allow: [_] }] -- This casing is used to better display the commandName. */

import type { CommandInitialized as Command, CommandType, ContextType, OptionType } from '@mephisto5558/command';

type SetupMinigameChannelOptions = readonly [Readonly<{
  type: OptionType.Channel;
  required: true;
}>];


export declare const ban_kick_mute: Command<readonly [CommandType.Slash]>['run'];
export declare const lock_unlock: Command<readonly CommandType[]>['run'];
export declare const setupMinigameChannel: Command<
  readonly CommandType[], readonly [ContextType.Guild],
  SetupMinigameChannelOptions
>['run'];