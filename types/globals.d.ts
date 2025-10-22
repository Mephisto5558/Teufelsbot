/* eslint-disable sonarjs/no-built-in-override */

import type Discord from 'discord.js';
import type { Locale, Translator } from '@mephisto5558/i18n';
import type DiscordTicTacToe from 'discord-tictactoe';

import type locals from './locals';
import type DBStructure from './database';
import type { Log } from '../Utils/prototypeRegisterer';

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

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- same as in the original definition */
    filter(this: T[], predicate: BooleanConstructor, thisArg?: any): (T extends false | 0 | '' | null | undefined ? never : T)[];
  }

  interface Number {
    limit(options?: { min?: number; max?: number }): number;

    /** @returns If the number is more than `min` and less than `max`. */
    inRange(options: { min?: number; max?: number }): boolean;
    inRange(min?: number, max?: number): boolean;
  }

  interface BigInt {
    toString(radix?: 10): `${bigint}`;
  }

  interface Object {
    /** Removes `null`, `undefined`, empty arrays and empty objects recursively. */
    filterEmpty(this: object): object;

    /** The amount of items in the object. */
    __count__: number;
  }

  interface ObjectConstructor {
    // allows key to be more specific (e.g. Snowflake instead of string)
    entries<T extends object>(obj: T): ({ [K in keyof T]: [K, T[K]] })[keyof T][];

    keys<T extends object>(obj: T): (keyof T)[];
  }

  interface Function {
    // Only typing | Fixes return types | https://github.com/microsoft/TypeScript/blob/c790dc1dc7ff67e619a5a60fc109b7548f171322/src/lib/es5.d.ts#L313

    /**
     * Calls the function with the specified object as the this value and the elements of specified array as the arguments.
     * @param thisArg The object to be used as the this object.
     */
    apply<T, R>(this: (this: T) => R, thisArg: T): R;

    /**
     * Calls the function with the specified object as the this value and the elements of specified array as the arguments.
     * @param thisArg The object to be used as the this object.
     * @param args An array of argument values to be passed to the function.
     */
    apply<T, AX, R>(this: (this: T, ...args: AX[]) => R, thisArg: T, args: AX[]): R;

    /**
     * Calls the function with the specified object as the this value and the specified rest arguments as the arguments.
     * @param thisArg The object to be used as the this object.
     * @param args Argument values to be passed to the function.
     */
    call<T, AX, R>(this: (this: T, ...args: AX[]) => R, thisArg: T, ...args: AX[]): R;

    /**
     * Calls the function with the specified object as the this value and the specified rest arguments as the arguments.
     * @param thisArg The object to be used as the this object.
     * @param args Argument values to be passed to the function.
     */
    call<T, AX>(this: new (...args: AX[]) => T, thisArg: T, ...args: AX[]): void;

    /**
     * For a given function, creates a bound function that has the same body as the original function.
     * The this object of the bound function is associated with the specified object, and has the specified initial parameters.
     * @param thisArg The object to be used as the this object. */
    bind<T>(this: T, thisArg: ThisParameterType<T>): OmitThisParameter<T>;
    bind<T, AX, R>(this: (this: T, ...args: AX[]) => R, thisArg: T, ...args: AX[]): (...args: AX[]) => R;

    /** A wrapper for {@link Function.prototype.bind}. @see {@link bBoundFunction} */
    bBind<T extends GenericFunction>(this: T, thisArg: ThisParameterType<T>): bBoundFunction<T>;
    bBind<T, AX, R>(this: (this: T, ...args: AX[]) => R, thisArg: T, ...args: AX[]): bBoundFunction<(this: T, ...args: AX[]) => R>;
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
  const sleep: (ms: number) => Promise<void>;

  /** Custom logging, including logfiles. */
  const log: typeof Log;
  type log = typeof Log;

  /** Get an application Emoji's mention by it's name. */
  const getEmoji: (emoji: string) => `<a:${string}:${Snowflake}>` | `<${string}:${Snowflake}>` | undefined;

  type Snowflake = `${bigint}`;

  type Database = DBStructure.Database;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any -- used only as generic constraint */
  type GenericFunction = (...args: any) => any;

  type OmitFirstParameter<T extends GenericFunction> = Parameters<T> extends [unknown, ...infer Rest] ? Rest : never;

  type lang<UNF extends boolean = false, L extends Locale | undefined = Locale> = Translator<UNF, L>;

  // #endregion

  // #region commands
  type slashCommand<initialized extends boolean = false> = locals.BaseCommand<initialized> & {
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

  type prefixCommand<initialized extends boolean = false> = locals.BaseCommand<initialized> & {
    prefixCommand: true;
    aliases?: { prefix?: locals.BaseCommand['name'][] };
  };

  type command<
    commandType extends 'prefix' | 'slash' | 'both' = 'both',
    guildOnly extends boolean = true, initialized extends boolean = false
  > = locals.BaseCommand<initialized>
    & (commandType extends 'slash' | 'both' ? slashCommand<initialized> : object)
    & (commandType extends 'prefix' | 'both' ? prefixCommand<initialized> : object)
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

  type commandOptions<initialized extends boolean = boolean> = {
    name: string;

    /** Numbers in milliseconds */
    cooldowns?: locals.BaseCommand<initialized>['cooldowns'];

    /** If true, the user must provide a value to this option. This is also enforced for prefix commands. */
    required?: boolean;

    /**
     * Only existent for {@link commandOptions.type} `SubcommandGroup` and `Subcommand`.
     *
     * Makes the subcommand also work in direct messages. */
    dmPermission?: boolean;

    /** Like choices, but not enforced unless {@link commandOptions.strictAutocomplete} is enabled. */
    autocompleteOptions?: string | locals.autocompleteOptions[] | (
      (this: Discord.AutocompleteInteraction) => locals.autocompleteOptions[] | Promise<locals.autocompleteOptions>
    );

    /**
     * Return an error message to the user, if their input is not included in {@link commandOptions.autocompleteOptions}.
     * Note that this happens for Messages as well. */
    strictAutocomplete?: boolean;

    options?: commandOptions<initialized>[];

    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
  } & (initialized extends true ? {
    nameLocalizations?: locals.BaseCommand<true>['nameLocalizations'];

    /**
     * Gets set automatically from language files.
     * @see {@link command.description} */
    description: locals.BaseCommand<true>['description'];

    /**
     * Gets set automatically from language files.
     * @see {@link command.description} */
    descriptionLocalizations?: locals.BaseCommand<true>['descriptionLocalizations'];

    type: typeof Discord.ApplicationCommandOptionType;

    /** Choices the user must choose from. Can not be more then 25. */
    choices?: {
      name: string;
      nameLocalizations?: locals.BaseCommand<true>['nameLocalizations'];
      value: string | number;
    }[];
    autocomplete?: boolean;
    channelTypes?: (keyof typeof Discord.ChannelType)[];
  } : {
    type: keyof typeof Discord.ApplicationCommandOptionType;

    /** Choices the user must choose from. Can not be more then 25. */
    choices?: (string | number | {
      name: string;
      nameLocalizations?: locals.BaseCommand<true>['nameLocalizations'];
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
  interface NoCacheDB {
    /**
     * generates required database entries from {@link ./Templates/db_collections.json}.
     * @param overwrite overwrite existing collection, default: `false` */
    generate(overwrite?: boolean): Promise<void>;
  }
}

// #endregion

declare module 'express' {
  interface Request {
    user?: NonNullable<Database['website']['sessions'][keyof Database['website']['sessions']]>['user'];
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
    ? { years: number; months: number; days: number; hours: number; minutes: number; firstDateWasLater: boolean }
    : string;
}