import type {
  DMChannel, GuildChannel, GuildMember, Role, User, Collection, Guild, Snowflake,
  APIAllowedMentions, Message, BaseInteraction, MessageComponentInteraction,
  AutocompleteInteraction, CategoryChannel, GuildTextBasedChannel, GuildChannelManager,
  Webhook, WebhookType, VoiceState, TimestampStylesString, DateResolvable, BaseGuildTextChannel
} from 'discord.js';
import type { ExecOptions, PromiseWithChild } from 'node:child_process';
import type { GiveawaysManager, GiveawayData } from 'discord-giveaways';
import type { DB } from '@mephisto5558/mongoose-db';
import type { I18nProvider } from '@mephisto5558/i18n';
import type { Database, backupChannel, backupId } from '../types/database';

export { default as DiscordAPIErrorCodes } from './DiscordAPIErrorCodes.json';
export { default as prototypeRegisterer } from './prototypeRegisterer';

export declare namespace afk {
  const nicknamePrefix: string;
  const nicknameRegex: RegExp;

  function getAfkStatus(this: Interaction | Message, target: GuildMember | User, lang: lang): Promise<Message>;
  function listAfkStatuses(this: GuildInteraction | Message<true>, lang: lang): Promise<Message>;
  function setAfkStatus<T extends Interaction | Message | VoiceState>(
    this: T, lang: T extends VoiceState ? undefined : lang, global?: boolean, message?: string
  ): Promise<T extends VoiceState ? undefined : Message>;

  function removeAfkStatus(this: Message | VoiceState): Promise<Message | undefined>;
  function sendAfkMessages(this: Message): Promise<Message | undefined>;

  /* eslint-disable jsdoc/informative-docs */
  /**
   * @returns `undefined` if the bot cannot change the member's nickname or it already has the prefix. Otherwise `true` indicating success.
   * @default prefix='[AFK] ' */
  function setAfkPrefix(member: GuildMember, prefix?: string): Promise<true | undefined>;

  /**
   * @returns `undefined` if the bot cannot change the member's nickname or it doesn't have the prefix. Otherwise `true` indicating success.
   * @default prefix='[AFK] ' */
  function unsetAfkPrefix(member: GuildMember, prefix?: string): Promise<true | undefined>;
  /* eslint-enable jsdoc/informative-docs */
}

export declare function autocompleteGenerator(
  this: AutocompleteInteraction | Message,
  command: command<'both', boolean, true>, locale: string
): { name: string | number; value: string | number }[] | undefined;

type MaybeWithUndefined<X, T extends boolean> = T extends true ? X : X | undefined;
export declare namespace BackupSystem {
  type Options = {
    dbName?: string;
    maxGuildBackups?: number;
    maxMessagesPerChannel?: number;
    saveImages?: boolean;
    clearGuildBeforeRestore?: boolean;
  };

  type StatusObject = {
    status?: string;
  };

  type Backup = Database['backups'][backupId];

  type Utils = {
    fetchToBase64<T extends string | undefined>(url?: T): Promise<T extends undefined ? undefined : string>;
    loadFromBase64<T extends string | undefined>(base64Str?: T): T extends undefined ? undefined : Buffer;

    fetchCategoryChildren(
      category: CategoryChannel, saveImages: boolean, maxMessagesPerChannel: number
    ): Promise<backupChannel[]>;

    fetchChannelMessages(
      channel: GuildTextBasedChannel, saveImages: boolean, maxMessagesPerChannel: number
    ): Promise<backupChannel['messages']>;

    fetchChannelPermissions(channel: GuildChannel): backupChannel['permissions'];

    fetchChannelThreads(
      channel: GuildChannel, saveImages: boolean, maxMessagesPerChannel: number
    ): Promise<backupChannel['threads']>;

    fetchMessageAttachments(message: Message, saveImages: boolean): Promise<backupChannel['messages'][number]['attachments']>;

    fetchTextChannelData(
      channel: GuildChannel, saveImages: boolean, maxMessagesPerChannel: number
    ): Promise<backupChannel>;

    loadChannel(
      channel: backupChannel, guild: Guild, category: string, maxMessagesPerChannel: number,
      allowedMentions: APIAllowedMentions
    ): ReturnType<GuildChannelManager['create']>;

    loadChannelMessages<WEBHOOK = Webhook<WebhookType.Incoming>, T extends WEBHOOK | undefined>(
      channel: BaseGuildTextChannel, messages: backupChannel['messages'], webhook: T,
      maxMessagesPerChannel: number, allowedMentions: APIAllowedMentions
    ): Promise<T extends WEBHOOK ? T : WEBHOOK | undefined>;
  };

  /* eslint-disable-next-line @typescript-eslint/no-shadow -- false positive */
  class BackupSystem {
    constructor(db: DB<Database>, options?: Options);

    db: DB<Database>;

    /** Note: This can also be any other string, just called "backups" for DB typing. */
    dbName: 'backups';
    defaultSettings: {
      maxGuildBackups: Required<Options['maxGuildBackups']>;
      maxMessagesPerChannel: number;
      saveImages: boolean;
      clearGuildBeforeRestore: boolean;
    };

    get(backupId: Snowflake, guildId?: Snowflake): Backup | undefined;

    list(guildId?: Snowflake): Collection<string, Backup>;

    remove(backupId: string): Promise<boolean>;

    create(guild: Guild, options?: {
      statusObj?: StatusObject;
      id?: backupId;
      save?: boolean;
      maxGuildBackups?: number;
      backupMembers?: boolean;
      maxMessagesPerChannel?: number;
      doNotBackup?: string[];
      saveImages?: boolean;
      metadata?: unknown;
    }): Promise<Backup>;

    /** @param id If falsely, will use latest. */
    load(id: string | object | null, guild: Guild, options?: {
      statusObj?: StatusObject;
      clearGuildBeforeRestore?: boolean;
      maxMessagesPerChannel: number;
      allowedMentions?: APIAllowedMentions;
      reason?: string;
    }): Promise<void>;

    static readonly utils: Utils;
  }
}

/**
 * @returns The error key and replacement values for `lang()` or `false` if no error.
 * Returns `true` if error happend but has been handled internally. */
export declare function checkForErrors(
  this: BaseInteraction | Message,
  command: command<'both', boolean, true> | undefined, lang: lang
): Promise<[string, Record<string, string> | string | undefined] | boolean>;

/** @returns the error message id to use with i18n. */
export declare function checkTargetManageable(
  this: Interaction | Message,
  member: GuildMember
): string | undefined;

export declare function commandExecutionWrapper(
  this: BaseInteraction | Message,
  command: command<'both', boolean, true> | undefined, commandType: string, lang: lang
): Promise<Message | undefined>;

/** Formats an application command name and id into a command mention. */
export declare function commandMention<CommandName extends string, CommandId extends Snowflake>(
  name: CommandName, id: CommandId
): `</${CommandName}:${CommandId}>`;

export declare function componentHandler(
  this: MessageComponentInteraction,
  lang: lang
): Promise<unknown>;

export declare function convertToMedal(i: number): string;

export { cooldown as cooldowns };
declare function cooldown(
  this: BaseInteraction | Message,
  name: string, cooldowns?: Record<'user' | 'guild' | 'channel', number>
): number;

export declare function errorHandler(
  this: Client,
  err: Error, context?: unknown, lang?: lang
): Promise<void>;

export declare function filename(path: string): string;

export declare function findAllEntires(
  obj: Record<string, unknown>, key: string, entryList?: Record<string, unknown>
): Record<string, unknown>;

/** @throws {Error} on non-autofixable invalid data */
export declare function formatCommand<T extends command | commandOptions<false>>(
  option: T, path: string, id: string, i18n: I18nProvider
): T;

export declare function getAge(date: Date): number;

/**
 * Gets the original command name, not the alias name
 * @param command the command object or its name */
export declare function getCommandName(command: command | string): string;

export declare function getCommands(
  this: Client,
  lang: lang<true>
): {
  category: string;
  subTitle: '';
  aliasesDisabled: boolean;
  list: {
    commandName: string;
    commandUsage: string;
    commandDescription: string;
    commandAlias: string;
  }[];
}[];

export declare function getDirectories(
  path: string
): Promise<string>;

/** @default targetOptionName = 'channel' */
export declare function getTargetChannel<I extends Interaction | Message, T extends boolean>(
  interaction: I,
  { targetOptionName, returnSelf }: { targetOptionName?: string; returnSelf?: T }
): I extends GuildInteraction | Message<true> ? MaybeWithUndefined<GuildChannel, T> : MaybeWithUndefined<DMChannel, T>;

export declare function __getTargetMember<I extends Interaction | Message, T extends boolean>(
  interaction: I,
  { targetOptionName, returnSelf }: { targetOptionName: string; returnSelf?: T },
  seenList: Map<Snowflake, I extends GuildInteraction | Message<true> ? GuildMember : User>
): I extends GuildInteraction | Message<true> ? MaybeWithUndefined<GuildMember, T> : MaybeWithUndefined<User, T>;

/** @default targetOptionName = `target${index}` */
export declare function getTargetMembers<
  I extends Interaction | Message, Opts extends { targetOptionName?: string; returnSelf?: boolean }, O extends Opts | Opts[] | undefined
>(
  interaction: I, options: O
): I extends GuildInteraction | Message<true>
  ? (O extends Opts | undefined ? GuildMember | undefined : (GuildMember | undefined)[])
  : (O extends Opts | undefined ? User | undefined : (User | undefined)[]);

/** @default targetOptionName = 'target' */
export declare function getTargetRole<T extends boolean>(
  interaction: GuildInteraction | Message<true>,
  { targetOptionName, returnSelf }: { targetOptionName?: string; returnSelf?: T }
): MaybeWithUndefined<Role, T>;

export declare function gitpull(): Promise<Error | { message: 'OK' }>;

export { GiveawaysManagerWithOwnDatabase as GiveawaysManager };
declare type saveGiveawayMethod = (messageId: Snowflake, giveawayData: GiveawayData) => Promise<true>;
declare class GiveawaysManagerWithOwnDatabase extends GiveawaysManager {
  // @ts-expect-error discord-giveaways is not typed correctly in that case.
  protected getAllGiveaways(): GiveawayData[];

  protected saveGiveaway: saveGiveawayMethod;
  protected editGiveaway: saveGiveawayMethod;

  protected deleteGiveaway(
    messageId: Snowflake
  ): Promise<boolean>;
}

export declare function localizeUsage<CMD extends command<'both', false>>(
  command: CMD, path: string, i18n: I18nProvider
): [CMD['usage'], Record<string, CMD['usage']>] | [];

export declare function logSayCommandUse(
  this: Message<true>,
  member: GuildMember, lang: lang
): Promise<Message<true> | undefined>;

export declare function permissionTranslator<T extends string | string[]>(
  perms: T, locale: string | undefined, i18n: I18nProvider
): T;

/** https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js */
export declare function seededHash(str: string, seed?: number): number;

export declare function shellExec(
  command: string, options?: ExecOptions
): PromiseWithChild<{ stdout: string; stderr: string }>;

export { equal as slashCommandsEqual };
declare function equal<T extends command<'both', boolean, true> | commandOptions<true> | undefined>(
  a: T, b: T
): boolean;


/** @param timeStr a time string, @example '3w2d', '5h' */
export declare function timeValidator<T extends string | undefined>(
  timeStr?: T
): T extends undefined | '' | '-' | '+' ? [] : string[];

export declare namespace configValidator {
  function setDefaultConfig(): Partial<Client['config']>;

  /** @throws {Error} on invalid key or subkey type. */
  function configValidationLoop(
    obj: Record<string, unknown>, checkObj: Record<string, unknown>, allowNull?: boolean
  ): void;

  type validConfigEntry = 'object' | 'string' | 'boolean' | 'number' | { [key: string]: validConfigEntry };
  const validConfig: Record<string, validConfigEntry>;
}

export { TFormatter as timeFormatter };
declare namespace TFormatter {
  /** @param ms the time value in milliseconds since midnight, January 1, 1970 UTC. */
  function timeFormatter<T extends lang | undefined>(ms: number | Date, lang?: T): {
    total: number; negative: boolean;
    formatted: T extends undefined
      ? `${number}${number}${number}${number}-${number}${number}, ${number}${number}:${number}${number}:${number}${number}`
      : string;
  };


  function timestamp(time: DateResolvable): `<t:${number}>`;
  function timestamp<T extends TimestampStylesString>(time: DateResolvable, code: T): `<t:${number}:${T}>`;

  /* eslint-disable @typescript-eslint/no-magic-numbers */
  const
    msInSecond: 1000, secsInMinute: 60, minutesInHour: 60, hoursInDay: 24,
    daysInWeek: 7, daysInMonthMin: 28, daysInMonthAvg: 30, daysInMonthMax: 31, daysInYear: 365, monthsInYear: 12,
    secsInHour: number, secsInDay: number, secsInWeek: number, secsInMonth: number, secsInYear: number;
  /* eslint-enable @typescript-eslint/no-magic-numbers */
}

export declare namespace toMs {
  function secToMs(secs: number): number;
  function minToMs(mins: number): number;
  function hourToMs(hours: number): number;
  function dayToMs(days: number): number;
  function yearToMs(years: number): number;
}


export declare namespace constants {
  /* eslint-disable @typescript-eslint/no-magic-numbers */
  const
    pinnedMessagesMaxAmt: 250,
    autocompleteOptionsMaxAmt: 25,
    embedTitleMaxLength: 256,
    embedDescriptionMaxLength: 4096,
    embedFieldMaxAmt: 25,
    embedFieldValueMaxLength: 1024,
    messageMaxLength: 2000,
    memberNameMinLength: 1,
    memberNameMaxLength: 32,
    choicesMaxAmt: 25,
    choiceNameMinLength: 1,
    choiceNameMaxLength: 100,
    choiceValueMinLength: 2,
    choiceValueMaxLength: 100,
    buttonLabelMaxLength: 80,
    buttonURLMaxLength: 512,
    messageActionrowMaxAmt: 5,
    actionrowButtonMaxAmt: 5,
    auditLogReasonMaxLength: 400,
    maxBanMessageDeleteDays: 7,
    emojiNameMinLength: 2,
    emojiNameMaxLength: 32,
    snowflakeMinLength: 17,
    snowflakeMaxLength: 19,
    bulkDeleteMaxMessageAmt: 100,
    HTTP_STATUS_BLOCKED: 522,
    JSON_SPACES: 2,
    suffix: '...';
  /* eslint-enable @typescript-eslint/no-magic-numbers */
}