import { Events } from 'discord.js';

import debug from './debug.ts';
import error from './error.ts';
import guildCreate from './guildCreate.ts';
import guildDelete from './guildDelete.ts';
import interactionCreate from './interactionCreate.ts';
import messageCreate from './messageCreate.ts';
import messageDelete from './messageDelete.ts';
import messageDeleteBulk from './messageDeleteBulk.ts';
import messageUpdate from './messageUpdate.ts';
import clientReady from './clientReady.ts';
import threadCreate from './threadCreate.ts';
import voiceStateUpdate from './voiceStateUpdate.ts';

import type { ClientEvents } from 'discord.js';

export default {
  [Events.Debug]: debug,
  [Events.Error]: error,
  [Events.GuildCreate]: guildCreate,
  [Events.GuildDelete]: guildDelete,
  [Events.InteractionCreate]: interactionCreate,
  [Events.MessageCreate]: messageCreate,
  [Events.MessageDelete]: messageDelete,
  [Events.MessageBulkDelete]: messageDeleteBulk,
  [Events.MessageUpdate]: messageUpdate,
  [Events.ClientReady]: clientReady,
  [Events.ThreadCreate]: threadCreate,
  [Events.VoiceStateUpdate]: voiceStateUpdate,
};

type DropFirst<T extends unknown[]> = T extends [unknown, ...infer Rest] ? Rest : [];
export type DiscordEvent<Type extends keyof ClientEvents> = (
  this: ClientEvents[Type][0] extends string ? string & StringConstructor : ClientEvents[Type][0],
  ...args: [...args: DropFirst<ClientEvents[Type]>, client: Client]
) => unknown;