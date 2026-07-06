/* eslint-disable @eslint-community/eslint-comments/no-use -- This casing is used to better display the commandName. */
/* eslint camelcase: [error, { allow: [_] }] -- This casing is used to better display the commandName. */


import type { ButtonInteraction as DiscordButtonInteraction, InteractionResponse, Message } from 'discord.js';
import type { commandExecutionWrapper } from '@mephisto5558/command';

export { default as advice } from './advice.ts';
export { default as chatgpt } from './chatgpt.ts';
export { default as chatgpt_fetchAPI } from './chatgpt_fetchAPI.ts';
export { default as fact } from './fact.ts';
export { default as help } from './help.ts';
export {
  allQuery as help_allQuery,
  commandQuery as help_commandQuery,
  categoryQuery as help_categoryQuery,
  getCommands as help_getCommands,
  getCommandCategories as help_getCommandCategories
} from './help_utils.ts';
export { default as infoCMDs } from './infoCMDs.ts';
export { default as joke } from './joke.ts';
export { default as mgStats_formatTop } from './mgStats_formatTop.ts';
export { default as mgstats } from './mgStats.ts';
export { default as record } from './record.ts';
export { recordControls as record_recordControls, startRecording as record_startRecording } from './record_manage.ts';
export { default as reddit } from './reddit.ts';
export { default as rps_sendChallenge } from './rps_sendChallenge.ts';
export { default as rps } from './rps.ts';
export { default as serverbackup } from './serverbackup.ts';
export { createProxy as serverbackup_createProxy, hasPerm as serverbackup_hasPerm } from './serverbackup_utils.ts';
export { default as topic } from './topic.ts';
export { default as votingReminder } from './votingReminder.ts';

export type ComponentReturnType = ReturnType<typeof commandExecutionWrapper>;
export type Response<Cached extends boolean = boolean> = InteractionResponse<Cached> | Message<Cached> | undefined;
export type GuildButtonInteraction<customId extends string = string> = DiscordButtonInteraction<'cached'> & { customId: customId };
export type ButtonInteraction<customId extends string = string> = DiscordButtonInteraction<undefined> & { customId: customId };