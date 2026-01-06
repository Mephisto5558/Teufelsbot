import type Discord from 'discord.js';
import type LibWebServer, { customPage as LibCustomPage, dashboardSetting as LibDashboardSetting } from '@mephisto5558/bot-website';
import type { Locale } from '@mephisto5558/i18n';
import type { DB, SettingsPaths } from '@mephisto5558/mongoose-db';
import type { NextFunction, Request, Response } from 'express';

type autocompleteOptions = string | number | { name: string; value: string };

export type commandTypes = 'prefix' | 'slash' | 'both';
export type defaultCommandType = 'both';

type BaseCommand<initialized extends boolean = boolean, commandType extends commandTypes = defaultCommandType> = {

  /** Numbers in milliseconds */
  cooldowns?: { guild?: number; channel?: number; user?: number };

  permissions?: {
    client?: (keyof Discord.PermissionFlags)[];
    user?: (keyof Discord.PermissionFlags)[];
  };

  /** Makes the command also work in direct messages. */
  dmPermission?: boolean;

  /** Beta commands are the only commands that get loaded when `client.env == 'dev'`. */
  beta?: boolean;

  /** This command will not be loaded */
  disabled?: boolean;

  /** If enabled in {@link ./config.json} and set here, will be shown to the user when they try to run the command. */
  disabledReason?: string;

  /** Slash command options */
  options?: commandOptions<initialized, commandType>[];
}
& (initialized extends true ? {

  /**
   * Gets set to the command's filename.
   * For slash commands, must be lowercase. */
  readonly name: string;

  /** Currently not used */
  readonly nameLocalizations?: Record<string, BaseCommand<true, commandType>['name']>;

  /**
   * Gets set automatically from language files.
   * For slash commands, can not be longer then 100 chars. */
  readonly description: string;

  /**
   * Gets set automatically from language files.
   * `undefined` only for an unknown language
   * @see {@link command.description} */
  readonly descriptionLocalizations: Record<Locale, BaseCommand<true, commandType>['description']>;

  /**
   * Command usage information for the end-user.
   * Should be in the command file if its language-independent, otherwise in the language files.
   *
   * Gets modified upon initialization. */
  readonly usage: { usage?: string; examples?: string };

  /**
   * Gets set automatically from language files.
   * @see {@link command.usage} */
  readonly usageLocalizations: Record<string, BaseCommand['usage']>;

  /** Gets set to the lowercase folder name the command is in. */
  readonly category: string;

  /** If the command is an alias, this property will have the original name. */
  readonly aliasOf?: BaseCommand['name'];

  /** The command's full file path, used for e.g. reloading the command. */
  readonly filePath: string;
} : {

  /** To change the name, change the filename to the desired name. */
  readonly name?: string;
  readonly description?: string;

  usage?: { usage?: string; examples?: string };

  /** To change the category, change the directory name to the desired category instead. */
  readonly category?: string;
});

type Config = {
  /** Will always include the application owner (or application team owner if existing) id */
  devIds: Set<Snowflake>;

  /** @default ['dev-only'] */
  devOnlyFolders: string[];
  website: {
    domain?: string;
    port?: number;
    dashboard?: string;
    privacyPolicy?: string;
    invite?: string;
    uptime?: string;
    vote?: string;
    todo?: string;
  };
  github: {
    repo?: string;
    userName?: string;
    repoName?: string;
  };
  discordInvite?: string;
  mailAddress?: string;
  hideOverwriteWarning?: boolean;
  hideNonBetaCommandLog?: boolean;
  hideDisabledCommandLog?: boolean;

  /** @default true */
  replyOnDisabledCommand: boolean;

  /** @default true */
  replyOnNonBetaCommand: boolean;
  disableWebserver?: boolean;
  disableCommands?: boolean;
  enableConsoleFix?: boolean;
};

type BoundFunction<isAsync extends boolean = false> = new (
  this: Message, __dirname: string, __filename: string, module: NodeJS.Module, exports: NodeJS.Module['exports'], require: NodeJS.Require, lang: lang
) => GenericFunction<isAsync extends true ? Promise<unknown> : unknown>;

type FlattenedGuildSettings = SettingsPaths<Database['guildSettings'][Snowflake]>;
type FlattenedUserSettings = SettingsPaths<Database['userSettings'][Snowflake]>;

export declare class WebServer<Ready extends boolean = boolean> extends LibWebServer<Ready> {
  db: DB<Database>;
  client: Client<Ready>;
}

export type ReplaceMethod<T, K extends keyof T, This, Args extends unknown[] = Parameters<T[K]>> = StrictOmit<T, K> & {
  [P in K]: Exclude<T[P], GenericFunction> | ((this: This, ...args: Args) => ReturnType<Extract<T[P], GenericFunction>>);
};

type GetReadyState<T> = T extends GenericFunction
  ? ThisParameterType<T> extends LibWebServer<infer Ready>
    ? Ready
    : never
  : never;

// Modifying the `this` type and params
export type customPage<RunReqBody = unknown, RunResBody = unknown> = ReplaceMethod<
  LibCustomPage, 'run', WebServer<GetReadyState<LibCustomPage['run']>>, [
    res: Response<RunResBody | undefined>,
    req: Request<undefined, undefined, RunReqBody | undefined>,
    next: NextFunction
  ]
>;

// Modifying the `this` type
export type dashboardSetting = ReplaceMethod<
  ReplaceMethod<
    ReplaceMethod<LibDashboardSetting, 'set', WebServer<GetReadyState<LibDashboardSetting['set']>>>,
    'get', WebServer<GetReadyState<LibDashboardSetting['get']>>
  >, 'type', WebServer<GetReadyState<LibDashboardSetting['type']>>
>;