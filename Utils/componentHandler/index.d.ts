/* eslint camelcase: [error, { allow: [_] }] -- This casing is used to better display the commandName. */
import type {
  ActionRow, BaseInteraction, ButtonComponent, ButtonInteraction, Collection, EmbedBuilder, GuildMember,
  InteractionResponse, StringSelectMenuComponent, StringSelectMenuInteraction
} from 'discord.js';
import type { commandExecutionWrapper } from '@mephisto5558/command';
import type { BackupSystem } from '..';

export {
  advice,
  chatgpt,
  chatgpt_fetchAPI,
  fact,
  help_commandQuery,
  help_categoryQuery,
  help_getCommands,
  help_getCommandCategories,
  help_allQuery,
  help,
  infoCMDs,
  joke,
  mgStats_formatTop,
  mgStats,
  record_startRecording,
  record_recordControls,
  record,
  reddit,
  rps_sendChallenge,
  rps,
  serverbackup_hasPerm,
  serverbackup_createProxy,
  serverbackup,
  topic,
  votingReminder
};

type ComponentReturnType = ReturnType<typeof commandExecutionWrapper>;
type Response<Cached extends boolean = boolean> = InteractionResponse<Cached> | Message<Cached> | undefined;
type GuildButtonInteraction = ButtonInteraction<'cached'>;

declare function advice(
  this: GuildButtonInteraction & { customId: 'advice' },
  lang: lang
): ComponentReturnType;

declare function chatgpt<
  USER_ID extends Snowflake,
  COMMAND extends 'regenerate',
  MODEL extends string
>(
  this: ButtonInteraction<undefined> & { customId: `chatgpt.${USER_ID}.${COMMAND}.${MODEL}` },
  lang: lang, userId: USER_ID, command: COMMAND, model: MODEL
): ComponentReturnType;

declare function chatgpt_fetchAPI<
  MODEL extends string
>(
  this: Interaction | Message | ButtonInteraction<undefined>,
  lang: lang, model?: MODEL, deep?: boolean
): Promise<[string, MODEL]>;

declare function fact(
  this: ButtonInteraction<undefined> & { customId: 'fact' },
  lang: lang
): ComponentReturnType;

declare function help_commandQuery(
  this: Interaction | Message | StringSelectMenuInteraction,
  lang: lang, query: string
): Promise<Message>;
declare function help_categoryQuery(
  this: Interaction | Message | StringSelectMenuInteraction,
  lang: lang, query?: string
): Promise<Message>;
declare function help_getCommands(this: Interaction | Message): Command<['slash', 'prefix'], boolean>[];
declare function help_getCommandCategories(this: Interaction | Message): string[];
declare function help_allQuery(
  this: Interaction | Message,
  lang: lang
): Promise<Message>;
declare function help<TYPE extends 'command' | 'category' | 'all'>(
  this: StringSelectMenuInteraction<undefined> & { customId: `help.${TYPE}` },
  lang: lang, type: TYPE
): Promise<Message>;

declare function infoCMDs<
  ID extends Snowflake,
  MODE extends 'kick' | 'ban' | 'delete' | 'addToGuild' | 'addToSelectedGuild',
  ENTITY_TYPE extends 'members' | 'emojis' | 'roles'
>(
  this: (MODE extends 'addToSelectedGuild' ? StringSelectMenuInteraction<'cached'> : GuildButtonInteraction) & {
    customId: `infoCMDs.${ID}.${MODE}.${ENTITY_TYPE}`;
    message: {
      components: [ActionRow<MODE extends 'addToSelectedGuild' ? StringSelectMenuComponent : ButtonComponent>];
    };
  },
  lang: lang, id: ID, mode: MODE, entityType: ENTITY_TYPE
): Promise<Response<true>>;

declare function joke<
  API extends string, TYPE extends string, BLACKLIST extends string, MAX_LENGTH extends `${number}`
>(
  this: ButtonInteraction<undefined> & { customId: `joke.${API}.${TYPE}.${BLACKLIST}.${MAX_LENGTH}` },
  lang: lang, api: API, type: TYPE, blacklist: BLACKLIST, maxLength: MAX_LENGTH
): ComponentReturnType;

declare function mgStats_formatTop(
  this: BaseInteraction<'cached'> | Message<true>,
  input: [Snowflake, { draws?: number; wins?: number; losses?: number }][],
  lang: lang,
  config?: { sort?: 'f'; mode?: 'draws' | 'losses' | 'alphabet_user' | 'alphabet_nick'; maxLength?: number; amt?: number }
): string | undefined;

declare function mgStats<
  GAME extends string, MODE extends 'sort' | undefined, SETTINGS extends 'all_users' | undefined
>(
  this: StringSelectMenuInteraction<'cached'> & {
    customId: `mgstats.${GAME}.${MODE}.${SETTINGS}`;
    message: {
      components: [ActionRow<StringSelectMenuComponent>];
    };
  },
  lang: lang, game: GAME, wMode: MODE, settings: SETTINGS
): Promise<MODE extends 'sort' ? InteractionResponse : undefined>;

declare function record_startRecording(
  this: GuildButtonInteraction,
  lang: lang, requesterId: Snowflake, voiceChannelId: Snowflake, isPublic: boolean,
  vcCache: { userId: Snowflake; allowed: boolean }[]
): Promise<Message | undefined>;

type guildId = Snowflake;
type voiceChannelId = Snowflake;
declare function record_recordControls(
  this: GuildButtonInteraction,
  lang: lang, mode: string, voiceChannelId: voiceChannelId, isPublic: boolean,
  cache: Collection<guildId, Collection<voiceChannelId, { userId: Snowflake; allowed: boolean }[]>>
): Promise<Response<true>>;

type ControlElements = 'pause' | 'stop';
declare function record<
  MODE extends 'memberAllow' | 'memberDeny' | 'cancel' | ControlElements | 'get',
  REQUESTER_ID extends MODE extends 'get' ? string : Snowflake, VOICE_CHANNEL_ID extends Snowflake, IS_PUBLIC extends `${boolean}`
>(
  this: GuildButtonInteraction & { customId: `record.${MODE}.${REQUESTER_ID}.${VOICE_CHANNEL_ID}.${IS_PUBLIC}` },
  lang: lang, mode: MODE, requesterId: REQUESTER_ID, voiceChannelId: VOICE_CHANNEL_ID, isPublic: IS_PUBLIC
): Promise<Message | undefined>;

declare function reddit<
  SUBREDDIT extends string, TYPE extends string, FILTER_NSFW extends `${boolean}`
>(
  this: ButtonInteraction<undefined> & { customId: `reddit.${SUBREDDIT}.${TYPE}.${FILTER_NSFW}` },
  lang: lang, subreddit: SUBREDDIT, type: TYPE, filterNSFW: FILTER_NSFW
): ComponentReturnType;

declare function rps_sendChallenge(
  this: GuildInteraction | Message<true> | GuildButtonInteraction, lang: lang,
  initiator: GuildMember, opponent?: GuildMember
): Promise<InteractionResponse | Message>;

export type PlayOptions = NonNullable<NonNullable<Database['guildSettings'][Snowflake]['minigames']>['rps'][Snowflake]['player1']>;
declare function rps<
  INITIATOR_ID extends Snowflake, MODE extends 'cancel' | 'decline' | 'accept' | 'playAgain' | PlayOptions,
  OPPONENT_ID extends Snowflake
>(
  this: GuildButtonInteraction & { customId: `rps.${INITIATOR_ID}.${MODE}.${OPPONENT_ID}` },
  lang: lang, initiatorId: INITIATOR_ID, mode: MODE, opponentId: OPPONENT_ID
): Promise<Response<true>>;

declare function serverbackup_hasPerm(
  this: GuildInteraction | GuildButtonInteraction,
  backup?: Database['backups'][keyof Database['backups']]
): boolean;

declare function serverbackup_createProxy(
  interaction: GuildInteraction | GuildButtonInteraction,
  embed: EmbedBuilder, lang: lang,
  langKeys: Record<string, string | number> | string | number
): BackupSystem.StatusObject;

declare function serverbackup<
  MODE extends 'load', BACKUP_ID extends keyof Database['backups'], OPTION extends 'start' | 'cancel', CLEAR_GUILD_BEFORE_RESTORE extends `${boolean}`
>(
  this: GuildButtonInteraction & { customId: `serverbackup.${MODE}.${BACKUP_ID}.${OPTION}.${CLEAR_GUILD_BEFORE_RESTORE}` },
  lang: lang, mode: MODE, backupId: BACKUP_ID, option: OPTION, clearGuildBeforeRestore: CLEAR_GUILD_BEFORE_RESTORE
): Promise<Response<true>>;

declare function topic(
  this: ButtonInteraction<undefined> & { customId: 'topic' },
  lang: lang
): ComponentReturnType;

declare function votingReminder<MODE extends 'enable' | 'disable'>(
  this: ButtonInteraction<'raw'> & {
    customId: `votingReminder.${MODE}`;
    message: {
      components: [ActionRow<ButtonComponent>];
    };
  },
  lang: lang, mode: MODE
): ComponentReturnType;