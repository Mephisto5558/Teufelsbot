import type LibWebServer, { customPage as LibCustomPage, dashboardSetting as LibDashboardSetting } from '@mephisto5558/bot-website';
import type { DB, SettingsPaths } from '@mephisto5558/mongoose-db';
import type { NextFunction, Request, Response } from 'express';

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