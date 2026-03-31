/* eslint-disable sonarjs/no-built-in-override */

import type Discord from 'discord.js';
import type { Locale, Translator } from '@mephisto5558/i18n';
import type DiscordTicTacToe from 'discord-tictactoe';

import type { LogInterface } from '../Utils/prototypeRegisterer';
import type DBStructure from './database';

// #region global
declare global {
  // #region Buildins
  /* eslint-disable @typescript-eslint/consistent-type-definitions */
  namespace NodeJS {
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
      pterodactylPanelURL?: `http${'s' | ''}://${string}.${string}`;
      pterodactylServerId?: string;
      pterodactylServerAPIKey?: string;
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

  interface Object {
    /** The amount of items in the object. */
    get __count__(this: object): number;
  }

  /* eslint-enable @typescript-eslint/consistent-type-definitions */
  // #endregion

  // #region custom
  /** Custom logging, including logfiles. */
  const log: LogInterface;
  type log = LogInterface;

  type Database = DBStructure.Database;

  type lang<UNF extends boolean = false, L extends Locale | undefined = Locale> = Translator<UNF, L>;
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

declare module '@mephisto5558/command' {
  interface CommandClient<Ready extends boolean = boolean> extends Discord.Client<Ready> {}

  interface ChatInputCommandInteraction<C, DM, Options> extends Discord.ChatInputCommandInteraction {}
  interface Message<C, DM> extends Discord.Message {}
  interface AutocompleteInteraction<C, DM> extends Discord.AutocompleteInteraction {}
  interface MessageComponentInteraction<C, DM> extends Discord.MessageComponentInteraction {}

  // Inherit custom prototype properties
  interface ChatInputCommandInteraction<C, DM, Options> extends OptionalMessageProperties<DM extends false ? true : boolean> {}
  interface Message<C, DM> extends OptionalInteractionProperties<DM extends false ? true : boolean> {}
  interface AutocompleteInteraction<C, DM> extends OptionalMessageProperties<DM extends false ? true : boolean> {}
  interface MessageComponentInteraction<C, DM> extends OptionalMessageProperties<DM extends false ? true : boolean> {}
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