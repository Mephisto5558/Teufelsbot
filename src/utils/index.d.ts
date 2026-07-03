import type {
  APIAllowedMentions, AnyThreadChannel, BaseGuildTextChannel, CategoryChannel, ChatInputCommandInteraction, Collection,
  DateResolvable, Guild, GuildChannel, GuildChannelManager, GuildMember, GuildTextBasedChannel, Message, MessageComponentInteraction,
  Role, Snowflake, TimestampStylesString, User, VoiceState, Webhook, WebhookType
} from 'discord.js';
import type { ExecOptions, PromiseWithChild } from 'node:child_process';
import type { ContextType, commandDoneFn, customPermissionChecksFn } from '@mephisto5558/command';
import type { I18nProvider, Locale } from '@mephisto5558/i18n';
import type { DB } from '@mephisto5558/mongoose-db';
import type { GiveawayData, GiveawaysManager } from 'discord-giveaways';
import type { Database, backupChannel, backupId } from '../types/database';
import type { Config } from '../types/locals';

export { default as DiscordAPIErrorCodes } from './DiscordAPIErrorCodes.json';
export { default as prototypeRegisterer } from './prototypeRegisterer';

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
    loadFromBase64<T extends string | undefined>(base64Str?: T): T extends undefined ? undefined : Buffer<ArrayBuffer>;

    fetchCategoryChildren(
      category: CategoryChannel, saveImages: boolean, maxMessagesPerChannel: number
    ): Promise<backupChannel[]>;

    fetchChannelMessages(
      channel: GuildTextBasedChannel, saveImages: boolean, maxMessagesPerChannel: number
    ): Promise<backupChannel['messages']>;

    fetchChannelPermissions(channel: GuildChannel): backupChannel['permissions'];

    fetchChannelThreads(
      channel: GuildChannel | GuildTextBasedChannel, saveImages: boolean, maxMessagesPerChannel: number
    ): Promise<backupChannel['threads']>;

    fetchMessageAttachments(message: Message, saveImages: boolean): Promise<backupChannel['messages'][number]['attachments']>;

    fetchTextChannelData(
      channel: BaseGuildTextChannel, saveImages: boolean, maxMessagesPerChannel: number
    ): Promise<backupChannel>;

    loadChannel(
      channel: backupChannel, guild: Guild, category: string, maxMessagesPerChannel: number,
      allowedMentions: APIAllowedMentions
    ): ReturnType<GuildChannelManager['create']>;

    loadChannelMessages<WEBHOOK extends Webhook = Webhook<WebhookType.Incoming>, T extends WEBHOOK | undefined>(
      channel: GuildTextBasedChannel | AnyThreadChannel, messages: backupChannel['messages'], webhook: T,
      maxMessagesPerChannel: number, allowedMentions: APIAllowedMentions
    ): Promise<T extends WEBHOOK ? T : WEBHOOK | undefined>;
  };

  /* eslint-disable-next-line @typescript-eslint/no-shadow -- false positive */
  class BackupSystem {
    db: DB<Database>;

    /** Note: This can also be any other string, just called "backups" for DB typing. */
    dbName: 'backups';
    defaultSettings: {
      maxGuildBackups: Required<Options['maxGuildBackups']>;
      maxMessagesPerChannel: number;
      saveImages: boolean;
      clearGuildBeforeRestore: boolean;
    };

    constructor(db: DB<Database>, options?: Options);

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

export declare function shellExec(
  command: string, options?: ExecOptions
): PromiseWithChild<{ stdout: string; stderr: string }>;

/** @example '3w2d', '5h' */
export declare function timeValidator<T extends string | undefined>(
  timeStr?: T
): T extends undefined | '' | '-' | '+' ? [] : string[];

export const updateCommandStats: commandDoneFn;

export declare function sleep(delay?: number): Promise<void>;

export { TFormatter as timeFormatter };
declare namespace TFormatter {
  /** @param ms the time value in milliseconds since midnight, January 1, 1970 UTC. */
  function timeFormatter<T extends lang | undefined>(ms: number, lang?: T): {
    total: number; negative: boolean;
    formatted: T extends undefined
      ? `${number}${number}${number}${number}-${number}${number}, ${number}${number}:${number}${number}:${number}${number}`
      : string;
  };


  function timestamp<T extends TimestampStylesString | undefined = TimestampStylesString | undefined>(
    time: DateResolvable, code?: T
  ): T extends undefined ? `<t:${number}>` : `<t:${number}:${T}>`;

  /* eslint-disable @typescript-eslint/no-magic-numbers -- these are constants */
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