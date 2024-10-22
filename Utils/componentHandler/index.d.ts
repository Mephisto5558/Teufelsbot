/* eslint-disable camelcase */
import type { BaseInteraction, ButtonInteraction, Collection, GuildMember, InteractionResponse, StringSelectMenuInteraction } from 'discord.js';
import type { commandExecutionWrapper } from '..';

export {
  advice,
  fact,
  help_commandQuery,
  help_categoryQuery,
  help_getCommands,
  help_getCommandCategories,
  help_allQuery,
  help,
  infoCMDs,
  joke,
  marin,
  mgStats_formatTopTen,
  mgStats,
  record_startRecording,
  record_recordControls,
  record,
  reddit,
  rps_sendChallenge,
  rps,
  topic
};

type ComponentReturnType = ReturnType<typeof commandExecutionWrapper>;
type Response = InteractionResponse | Message | undefined;

declare function advice(
  this: ButtonInteraction & { customId: 'fact' },
  lang: lang
): ComponentReturnType;

declare function fact(
  this: ButtonInteraction & { customId: 'fact' },
  lang: lang
): ComponentReturnType;

declare function help_commandQuery(
  this: Interaction | Message,
  lang: lang, query: string
): Promise<Message>;
declare function help_categoryQuery(
  this: Interaction | Message,
  lang: lang, query?: string
): Promise<Message>;
declare function help_getCommands(this: Interaction | Message): (command<'prefix', boolean, true> | command<'slash', boolean, true>)[];
declare function help_getCommandCategories(this: Interaction | Message): string[];
declare function help_allQuery(
  this: Interaction | Message,
  lang: lang
): Promise<Message>;
declare function help<TYPE extends 'command' | 'category' | 'all'>(
  this: StringSelectMenuInteraction & { customId: `help.${TYPE}` },
  lang: lang, type: TYPE
): Promise<Message>;

declare function infoCMDs<
  ID extends Snowflake,
  MODE extends 'kick' | 'ban' | 'delete' | 'addToGuild' | 'addToSelectedGuild',
  ENTITY_TYPE extends 'members' | 'emojis' | 'roles'
>(
  this: (ButtonInteraction | StringSelectMenuInteraction) & { customId: `infoCMDs.${ID}.${MODE}.${ENTITY_TYPE}` },
  lang: lang, id: ID, mode: MODE, entityType: ENTITY_TYPE
): Promise<Response>;

declare function joke<
  API extends string, TYPE extends string, BLACKLIST extends string, MAX_LENGTH extends `${number}`
>(
  this: ButtonInteraction & { customId: `joke.${API}.${TYPE}.${BLACKLIST}.${MAX_LENGTH}` },
  lang: lang, api: API, type: TYPE, blacklist: BLACKLIST, maxLength: MAX_LENGTH
): ComponentReturnType;

declare function marin(
  this: ButtonInteraction & { customId: 'marin' }, lang: lang
): ComponentReturnType;

declare function mgStats_formatTopTen(
  this: BaseInteraction | Message,
  input: { draws?: number; wins?: number; loses?: number }[],
  sort: 'f' | undefined, mode: 'draws' | 'losses' | 'alphabet_user' | 'alphabet_nick' | undefined, lang: lang,
  maxLength?: number
): string;
declare function mgStats<
  GAME extends string, MODE extends 'sort' | undefined, SETTINGS extends 'all_users' | undefined
>(
  this: StringSelectMenuInteraction & { customId: `mgstats.${GAME}.${MODE}.${SETTINGS}` },
  lang: lang, game: GAME, wMode: MODE, settings: SETTINGS
): Promise<MODE extends 'sort' ? InteractionResponse : undefined>;

declare function record_startRecording(
  this: ButtonInteraction,
  lang: lang, requesterId: Snowflake, voiceChannelId: Snowflake, isPublic: boolean,
  vcCache: { userId: Snowflake; allowed: boolean }[]
): Promise<Message | undefined>;

type guildId = Snowflake;
type voiceChannelId = Snowflake;
declare function record_recordControls(
  this: ButtonInteraction,
  lang: lang, mode: string, voiceChannelId: voiceChannelId, isPublic: boolean,
  cache: Collection<guildId, Collection<voiceChannelId, { userId: Snowflake; allowed: boolean }[]>>
): Promise<Response>;

type ControlElements = 'pause' | 'stop';
declare function record<
  MODE extends 'memberAllow' | 'memberDeny' | 'cancel' | ControlElements | 'get',
  REQUESTER_ID extends MODE extends 'get' ? string : Snowflake, VOICE_CHANNEL_ID extends Snowflake, IS_PUBLIC extends `${boolean}`
>(
  this: ButtonInteraction & { customId: `record.${MODE}.${REQUESTER_ID}.${VOICE_CHANNEL_ID}.${IS_PUBLIC}` },
  lang: lang, mode: MODE, requesterId: REQUESTER_ID, voiceChannelId: VOICE_CHANNEL_ID, isPublic: IS_PUBLIC
): Promise<Message | undefined>;

declare function reddit<
  SUBREDDIT extends string, TYPE extends string, FILTER_NSFW extends `${boolean}`
>(
  this: ButtonInteraction & { customId: `reddit.${SUBREDDIT}.${TYPE}.${FILTER_NSFW}` },
  lang: lang, subreddit: SUBREDDIT, type: TYPE, filterNSFW: FILTER_NSFW
): ComponentReturnType;

declare function rps_sendChallenge(
  this: GuildInteraction | Message<true> | ButtonInteraction<'cached'>,
  options: { initiator: GuildMember; opponent?: GuildMember; lang?: lang }
): Promise<InteractionResponse | Message>;

type PlayOptions = 'rock' | 'paper' | 'scissors';
declare function rps<
  INITIATOR_ID extends Snowflake, MODE extends 'cancel' | 'decline' | 'accept' | 'playAgain' | PlayOptions,
  OPPONENT_ID extends Snowflake
>(
  this: ButtonInteraction & { customId: `rps.${INITIATOR_ID}.${MODE}.${OPPONENT_ID}` },
  lang: lang, initiatorId: INITIATOR_ID, mode: MODE, opponentId: OPPONENT_ID
): Promise<Response>;

declare function topic(
  this: ButtonInteraction & { customId: 'topic' },
  lang: lang
): ComponentReturnType;