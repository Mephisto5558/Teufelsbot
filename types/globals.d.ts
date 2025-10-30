/* eslint-disable sonarjs/no-built-in-override */

import type Discord from 'discord.js';
import type { Locale, Translator } from '@mephisto5558/i18n';
import type DiscordTicTacToe from 'discord-tictactoe';

import type { LogInterface } from '../Utils/prototypeRegisterer';
import type DBStructure from './database';
import type locals, { commandTypes, defaultCommandType } from './locals';

type ISODate = `${number}${number}${number}${number}-${number}${number}-${number}${number}`;
type ISOTime = `${number}${number}:${number}${number}:${number}${number}.${number}${number}${number}`;
type ISODateTime = `${ISODate}T${ISOTime}Z`;

// #region global
declare global {
  // #region Buildins
  /* eslint-disable @typescript-eslint/consistent-type-definitions */
  namespace NodeJS {
    interface Process {

      /** The real process uptime. This property only exists if process args include uptime=... */
      childUptime?(): number;

      /**
       * If `process.childUptime` exists (process args includes uptime=...), this is
       *
       * `process.childUptime() + parentUptime`
       *
       * Otherwise it is the default `process.uptime()` */
      uptime(): number;
    }

    interface ProcessEnv {
      environment: 'main' | 'dev' | string & {};
      humorAPIKey: string;
      rapidAPIKey: string;
      githubKey: string;
      chatGPTApiKey: string;
      dbdLicense: string;
      votingWebhookURL?: string;
      token: string;
      secret: string;
      dbConnectionStr: string;
      restartServerURL?: `https://${string}/api/client/servers/${string}/power`;
      restartServerAPIKey?: string;
    }

    interface Require {
      /* eslint-disable-next-line @typescript-eslint/prefer-function-type -- overwriting only the function signature */
      (id: string): unknown;
    }
  }

  interface Array<T> {
    /**
     * Gets a random array element by generating a cryptographically secure random number using
     * {@link https://nodejs.org/api/crypto.html node:crypto}.
     *
     * May return undefined if the array is empty. */
    random(this: T[]): T | undefined;

    /** Returns an array with no duplicates by converting it to a `Set` and back to an array. */
    unique(this: T[]): T[];
  }

  interface Number {
    limit(options?: { min?: number; max?: number }): number;

    /** @returns If the number is more than `min` and less than `max`. */
    inRange(min?: number, max?: number): boolean;
  }

  interface BigInt {
    toString(radix?: 10): `${bigint}`;
  }

  interface Object {
    /** The amount of items in the object. */
    get __count__(this: object): number;
  }

  // https://github.com/uhyo/better-typescript-lib/issues/56#issuecomment-2580171329

  type KeyToString<K extends PropertyKey> = K extends string ? K : K extends number ? `${K}` : never;
  interface ObjectConstructor {
    keys<K extends PropertyKey, V>(o: [K, V] extends [never, never] ? never : Record<K, V>): KeyToString<K>[];
    values<K extends PropertyKey, V>(o: [K, V] extends [never, never] ? never : Record<K, V>): V[];
    entries<K extends PropertyKey, V>(o: [K, V] extends [never, never] ? never : Record<K, V>): [KeyToString<K>, V][];
  }

  interface Date {
    /**
     * Give a more precise return type to the method `toISOString()`:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString     */
    toISOString(): ISODateTime;
  }

  /* eslint-enable @typescript-eslint/consistent-type-definitions */
  // #endregion

  // #region custom
  const
    sleep: (ms: number) => Promise<void>,

    /** Custom logging, including logfiles. */
    log: LogInterface;
  type log = LogInterface;

  type Snowflake = `${bigint}`;

  type Database = DBStructure.Database;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- used only as generic constraint */
  type GenericFunction<Ret = any> = (...args: any) => Ret;

  type OmitFirstParameters<
    T extends GenericFunction, N extends number = 1, Acc extends unknown[] = []
  > = Acc['length'] extends N ? Parameters<T> extends [...Acc, ...infer Rest] ? Rest : never : OmitParameters<T, N, [...Acc, unknown]>;

  type lang<UNF extends boolean = false, L extends Locale | undefined = Locale> = Translator<UNF, L>;

  // #endregion

  // #region commands
  type slashCommand<
    initialized extends boolean = false,
    commandType extends commandTypes = defaultCommandType
  > = locals.BaseCommand<initialized, commandType> & {
    slashCommand: true;
    aliases?: { slash?: locals.BaseCommand['name'][] };

    /** Do not deferReply to the interaction */
    noDefer?: boolean;

    /**
     * Do `interaction.deferReply({ flags: MessageFlags.Ephemeral })`.
     *
     * Gets ignored if {@link command.noDefer} is `true`. */
    ephemeralDefer?: boolean;
  } & (initialized extends true ? {

    /** **Do not set manually.** */
    id: Snowflake;

    /** **Do not set manually.** */
    type: Discord.ApplicationCommandType.ChatInput;

    defaultMemberPermissions: Discord.PermissionsBitField;

    dmPermission: boolean;
  } : object);

  type prefixCommand<
    initialized extends boolean = false,
    commandType extends commandTypes = defaultCommandType
  > = locals.BaseCommand<initialized, commandType> & {
    prefixCommand: true;
    aliases?: { prefix?: locals.BaseCommand['name'][] };
  };

  type command<
    commandType extends commandTypes = defaultCommandType,
    guildOnly extends boolean = true, initialized extends boolean = false
  > = locals.BaseCommand<initialized, commandType>
    & (commandType extends 'slash' | 'both' ? slashCommand<initialized, commandType> : object)
    & (commandType extends 'prefix' | 'both' ? prefixCommand<initialized, commandType> : object)
    & {
      /**
       * `undefined` is only allowed if the command has Subcommands or Subcommand groups that have their own files.
       * **Must be explicitly set, even if `undefined`.**
       */
      run: ((
        this: commandType extends 'slash'
          ? Interaction<guildOnly>
          : commandType extends 'prefix'
            ? Message<guildOnly extends true ? true : boolean>
            : Interaction<guildOnly> | Message<guildOnly extends true ? true : boolean>,
        lang: lang, client: Discord.Client<true>
      ) => Promise<unknown>)
      | undefined;
    };

  type commandOptions<initialized extends boolean = boolean, commandType extends commandTypes = defaultCommandType> = {
    name: string;

    /** Numbers in milliseconds */
    cooldowns?: locals.BaseCommand<initialized, commandType>['cooldowns'];

    /** If true, the user must provide a value to this option. This is also enforced for prefix commands. */
    required?: boolean;

    /**
     * Only existent for {@link commandOptions.type} `SubcommandGroup` and `Subcommand`.
     *
     * Makes the subcommand also work in direct messages. */
    dmPermission?: boolean;

    /** Like choices, but not enforced unless {@link commandOptions.strictAutocomplete} is enabled. */
    autocompleteOptions?: string | locals.autocompleteOptions[] | (
      (
        this: commandType extends 'prefix'
          ? Discord.Message
          : commandType extends 'slash'
            ? Discord.AutocompleteInteraction<'cached'>
            : Discord.AutocompleteInteraction<'cached'> | Discord.Message,
        query: string
      ) => locals.autocompleteOptions[] | Promise<locals.autocompleteOptions>
    );

    /**
     * Return an error message to the user, if their input is not included in {@link commandOptions.autocompleteOptions}.
     * Note that this happens for Messages as well. */
    strictAutocomplete?: boolean;

    options?: commandOptions<initialized, commandType>[];

    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
  } & (initialized extends true ? {
    nameLocalizations?: locals.BaseCommand<true, commandType>['nameLocalizations'];

    /**
     * Gets set automatically from language files.
     * @see {@link command.description} */
    description: locals.BaseCommand<true, commandType>['description'];

    /**
     * Gets set automatically from language files.
     * @see {@link command.description} */
    descriptionLocalizations?: locals.BaseCommand<true, commandType>['descriptionLocalizations'];

    type: typeof Discord.ApplicationCommandOptionType;

    /** Choices the user must choose from. Can not be more then 25. */
    choices?: {
      name: string;
      nameLocalizations?: locals.BaseCommand<true, commandType>['nameLocalizations'];
      value: string | number;
    }[];
    autocomplete?: boolean;
    channelTypes?: (keyof typeof Discord.ChannelType)[];
  } : {
    type: keyof typeof Discord.ApplicationCommandOptionType;

    /** Choices the user must choose from. Can not be more then 25. */
    choices?: (string | number | {
      name: string;
      nameLocalizations?: locals.BaseCommand<true, commandType>['nameLocalizations'];
      value: string | number;
    })[];

    channelTypes?: (typeof Discord.ChannelType)[];
  });

  // #endregion

  // #region discord.js globals
  type Client<Ready extends boolean = true> = Discord.Client<Ready>;
  type Message<inGuild extends boolean = boolean> = Discord.Message<inGuild>;
  type Interaction<inGuild extends boolean = boolean> = inGuild extends true
    ? GuildInteraction : GuildInteraction | DMInteraction;

  type PartialMessage<inGuild extends boolean = boolean> = Discord.PartialMessage & (
    inGuild extends true ? {
      guild: Message<true>['guild'];
      guildId: Message<true>['guildId'];
      inGuild(): true;
    } : never
  );

  // used to not get `any` on Message property when the object is Message | Interaction
  type OptionalInteractionProperties<inGuild extends boolean = boolean> = Partial<Interaction<inGuild>>;
  type OptionalMessageProperties<inGuild extends boolean = boolean> = Partial<Message<inGuild>>;

  /** interface for an interaction in a guild. */
  /* eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- needs to be an interface */
  interface GuildInteraction extends Discord.ChatInputCommandInteraction<'cached'>, OptionalMessageProperties<true> {
    channel: Discord.GuildTextBasedChannel | undefined;
  }

  /** interface for an interaction in a direct message. */
  /* eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- needs to be an interface */
  interface DMInteraction extends Discord.ChatInputCommandInteraction<undefined>, OptionalMessageProperties<false> {
    inGuild(): false;
    inRawGuild(): false;
    inCachedGuild(): false;
    guild: null;
    guildId: null;
    guildLocale: null;
    commandGuildId: null;
    member: null;
    memberPermissions: null;

    channel: Discord.DMChannel;
  }

  // #endregion
}

// #endregion
/* eslint-disable @typescript-eslint/consistent-type-definitions -- working in lib's style */

// @ts-expect-error // keeping this here for documentation reasons, even tho it doesn't do anything sadly
declare module 'discord-tictactoe' {
  class TicTacToe {
    playAgain(interaction: Discord.ChatInputCommandInteraction): Promise<void>;
  }

  interface GameBoardButtonBuilder {

    /** Overwrite to make empty spaces look empty by using a zero width space. */
    createButton(row: number, col: number): Discord.ButtonBuilder;
  }
}

export declare class TicTacToe extends DiscordTicTacToe {
  playAgain(interaction: Discord.ChatInputCommandInteraction): Promise<void>;
}

// #region own libs
declare module '@mephisto5558/mongoose-db' {
  interface DB {
    /**
     * generates required database entries from {@link ./Templates/db_collections.json}.
     * @param overwrite overwrite existing collection, default: `false` */
    generate(overwrite?: boolean): Promise<void>;
  }
}

// #endregion
declare module 'express-session' {
  interface SessionData {
    redirectURL: string;
  }
}

declare module 'wikijs' {
  // intentional. `Page` in wikijs is defined as something that is not correct. All `Page`es are `RawPages` in code
  /* eslint-disable-next-line @typescript-eslint/no-empty-object-type */
  interface Page extends RawPage {}
}

declare module 'moment' {
  /** Only available if `moment-precise-range-plugin` is imported after importing `moment`. */
  export function preciseDiff<returnValueObject extends boolean>(
    d1: MomentInput, d2: MomentInput, returnValueObject: returnValueObject
  ): returnValueObject extends true
    ? { years: number; months: number; days: number; hours: number; minutes: number; seconds: number; firstDateWasLater: boolean }
    : string;
}