/* eslint camelcase: [error, { allow: [_] }] -- This casing is used to better display the commandName. */

import type { Command, CommandType } from '@mephisto5558/command';

type SlashCommand = Command<[CommandType.Slash]>['run'];
type MixedCommand = Command<CommandType[]>['run'];

export declare const ban_kick_mute: SlashCommand;
export declare const lock_unlock: MixedCommand;
export declare const setupMinigameChannel: MixedCommand;