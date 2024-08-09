import type {
  DMChannel, GuildChannel, GuildMember, Role, User, Collection, Guild, Snowflake,
  APIAllowedMentions, Message, BaseInteraction, MessageComponentInteraction,
  AutocompleteInteraction, CategoryChannel, GuildTextBasedChannel, GuildChannelManager,
  Webhook
} from 'discord.js';
import type { ExecOptions, PromiseWithChild } from 'node:child_process';
import type { GiveawaysManager, GiveawayData } from 'discord-giveaways';
import type { DB } from '@mephisto5558/mongoose-db';
import type I18nProvider from '@mephisto5558/i18n';
import type { Database, backupChannel, backupId } from '../types/database';

export {
  autocompleteGenerator,
  BackupSystem,
  checkForErrors,
  checkTargetManageable,
  commandExecutionWrapper,
  componentHandler,
  configValidator,
  cooldown as cooldowns,
  errorHandler,
  findAllEntires,
  format as formatSlashCommand,
  getAge,
  getCommands,
  getDirectories,
  getTargetChannel,
  getTargetMember,
  getTargetRole,
  gitpull,
  GiveawaysManagerWithOwnDatabase as GiveawaysManager,
  localizeUsage,
  logSayCommandUse,
  permissionTranslator,
  shellExec,
  equal as slashCommandsEqual,
  timeFormatter,
  timeValidator
};

export { default as DiscordAPIErrorCodes } from './DiscordAPIErrorCodes.json';
export { default as prototypeRegisterer } from './prototypeRegisterer';


declare function autocompleteGenerator(
  this: AutocompleteInteraction | Message,
  command: command<'both', boolean, true>, locale: string
): { name: string | number; value: string | number }[] | undefined;

type MaybeWithUndefined<X, T extends boolean> = T extends true ? X : X | undefined;
declare namespace BackupSystem {
  interface Options {
    dbName?: string;
    maxGuildBackups?: number;
    maxMessagesPerChannel?: number;
    saveImages?: boolean;
    clearGuildBeforeRestore?: boolean;
  }

  interface StatusObject {
    status?: string;
  }

  type Backup = Database['backups'][backupId];

  type Utils = {
    fetchToBase64<T extends string | undefined>(url?: T): Promise<T>;
    loadFromBase64<T extends string | undefined>(base64Str?: T): T extends undefined ? undefined : Buffer;

    fetchCategoryChildren(
      category: CategoryChannel, saveImages: boolean, maxMessagesPerChannel: number
    ): Promise<backupChannel[]>;

    fetchChannelMessages(
      channel: GuildTextBasedChannel, saveImages: boolean, maxMessagesPerChannel: number
    ): Promise<backupChannel['messages']>;

    fetchChannelPermissions(channel: GuildChannel): (backupChannel['permissions'][0] | undefined)[];

    fetchChannelThreads(
      channel: GuildChannel, saveImages: boolean, maxMessagesPerChannel: number
    ): Promise<backupChannel['threads']>;

    fetchMessageAttachments(message: Message, saveImages: boolean): Promise<{
      name: string; attachment?: string;
    }>;

    fetchTextChannelData(
      channel: GuildChannel, saveImages: boolean, maxMessagesPerChannel: number
    ): Promise<backupChannel>;

    loadChannel(
      channel: GuildChannel, guild: Guild, category: string, maxMessagesPerChannel: number,
      allowedMentions: APIAllowedMentions
    ): ReturnType<GuildChannelManager['create']>;

    loadChannelMessages<T extends Webhook | undefined>(
      channel: GuildTextBasedChannel, messages: Message[], webhook: T,
      maxMessagesPerChannel: number, allowedMentions: APIAllowedMentions
    ): Promise<T extends Webhook ? T : undefined>;
  };

  /* eslint-disable-next-line @typescript-eslint/no-shadow -- false positive */
  class BackupSystem {
    constructor(db: DB, options?: Options);

    db: DB;
    dbName: Options['dbName'];
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
      id?: string;
      save?: boolean;
      maxGuildBackups?: number;
      backupMembers?: boolean;
      maxMessagesPerChannel?: number;
      doNotBackup?: string[];
      saveImages?: boolean;
      metadata?: unknown;
    }): Promise<Backup>;

    /** @param id If falsely, will use latest.*/
    load(id: string | object | null, guild: Guild, options?: {
      statusObj?: StatusObject;
      clearGuildBeforeRestore?: boolean;
      maxMessagesPerChannel: number;
      allowedMentions?: APIAllowedMentions;
      reason?: string;
    }): Promise<void>;

    static utils: Utils;
  }
}

/** @returns The error key and replacement values for `lang()` or `false` if no error. Returns `true` if error happend but has been handled internally.*/
declare function checkForErrors(
  this: BaseInteraction | Message,
  command: command<'both', boolean, true> | undefined, lang: lang
): [string, Record<string, string> | string | undefined] | boolean;

/** @returns the error message id to use with i18n.*/
declare function checkTargetManageable(
  this: Interaction | Message,
  member: GuildMember
): string | undefined;

declare function commandExecutionWrapper(
  this: BaseInteraction | Message,
  command: command<'both', boolean, true> | undefined, commandType: string, lang: lang
): Promise<Message | undefined>;

declare function componentHandler(
  this: MessageComponentInteraction,
  lang: lang
): Promise<unknown>;

declare function cooldown(
  this: BaseInteraction | Message,
  name: string, cooldowns?: Record<string, number>
): number;

declare function errorHandler(
  this: Client,
  err: Error, message: BaseInteraction | Message | null, lang?: lang
): Promise<void>;

declare function findAllEntires(
  obj: Record<string, unknown>, key: string, entryList?: Record<string, unknown>
): Record<string, unknown>;

/** @throws {Error} on non-autofixable invalid data*/
declare function format<T extends command<'slash', boolean> | commandOptions<false>>(
  option: T, path: string, i18n: I18nProvider
): T;

declare function getAge(date: Date): number;

declare function getCommands(
  this: Client,
  lang: langUNF
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

declare function getDirectories(
  path: string
): Promise<string>;

/** @default targetOptionName = 'channel'*/
declare function getTargetChannel<I extends Interaction | Message, T extends boolean>(
  interaction: I,
  { targetOptionName, returnSelf }: { targetOptionName?: string; returnSelf?: T }
): I extends GuildInteraction | Message<true> ? MaybeWithUndefined<GuildChannel, T> : MaybeWithUndefined<DMChannel, T>;

/** @default targetOptionName = 'target'*/
declare function getTargetMember<I extends Interaction | Message, T extends boolean>(
  interaction: I,
  { targetOptionName, returnSelf }: { targetOptionName?: string; returnSelf?: T }
): I extends GuildInteraction | Message<true> ? MaybeWithUndefined<GuildMember, T> : MaybeWithUndefined<User, T>;

/** @default targetOptionName = 'target'*/
declare function getTargetRole<T extends boolean>(
  interaction: GuildInteraction | Message<true>,
  { targetOptionName, returnSelf }: { targetOptionName?: string; returnSelf?: T }
): MaybeWithUndefined<Role, T>;

declare function gitpull(): Promise<Error | 'OK'>;

declare class GiveawaysManagerWithOwnDatabase extends GiveawaysManager {
  // @ts-expect-error discord-giveaways is not typed correctly in that case.
  protected getAllGiveaways(): Promise<GiveawayData[]>;
  protected saveGiveaway(
    messageId: Snowflake, giveawayData: GiveawayData
  ): Promise<true>;
  /* eslint-disable-next-line @typescript-eslint/unbound-method */ // @ts-expect-error probably not optimal solution, but it works.
  protected editGiveaway = this.saveGiveaway;
  protected deleteGiveaway(
    messageId: Snowflake
  ): Promise<boolean>;
}

declare function localizeUsage<CMD extends command<'both', false>>(
  command: CMD, path: string, i18n: I18nProvider
): [CMD['usage'], Record<string, CMD['usage']>] | [];

declare function logSayCommandUse(
  this: Message<true>,
  member: GuildMember, lang: lang
): Promise<Message<true> | undefined>;

declare function permissionTranslator<T extends string | string[]>(
  perms: T, locale: string | undefined, i18n: I18nProvider
): T;

declare function shellExec(
  command: string, options?: ExecOptions
): PromiseWithChild<{ stdout: string;stderr: string }>;

declare function equal<T extends command<'both', boolean, true> | commandOptions<true> | undefined>(
  a: T, b: T
): boolean;

/** @returns `formatted` has the format `year-day, hour:minute:second` if `lang` is not provided.*/
declare function timeFormatter<T extends lang | undefined>(
  sec?: number, lang?: T
): {
  total: number; negative: boolean;
  formatted: T extends undefined
    ? `${number}${number}${number}${number}-${number}${number}, ${number}${number}:${number}${number}:${number}${number}`
    : string;
};

/** @param timeStr a time string, @example '3w2d', '5h' */
declare function timeValidator<T extends string | undefined>(
  timeStr?: T
): T extends undefined | '' | '-' | '+' ? [] : string[];

declare namespace configValidator {
  /** @throws {Error} on invalid key or subkey.*/
  function validateConfig(): void;
  function setDefaultConfig(): Partial<Client['config']>;

  /** @throws {Error} on invalid key or subkey type.*/
  function configValidationLoop(
    obj: Record<string, unknown>, checkObj: Record<string, unknown>, allowNull?: boolean
  ): void;

  type validConfigEntry = 'object' | 'string' | 'boolean' | 'number' | { [key: string]: validConfigEntry };
  const validConfig: Record<string, validConfigEntry>;
  const validEnv: Record<string, validConfigEntry>;
}