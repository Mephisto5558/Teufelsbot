/* eslint-disable-next-line import-x/no-unassigned-import, import-x/no-empty-named-blocks, import-x/order, unicorn/require-module-specifiers
 -- fixes typing issues with WebServer.client */
import type {} from './discord.js.js';

import type { CustomPage as LibCustomPage, DashboardSetting as LibDashboardSetting, WebServer as LibWebServer } from '@mephisto5558/bot-website';
import type { DB, SettingsPaths } from '@mephisto5558/mongoose-db';

/* eslint-disable-next-line import-x/no-extraneous-dependencies -- @types/express is installed */
import type { NextFunction, Request, Response } from 'express';

export type Config = {
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

export type BoundFunction<isAsync extends boolean = false> = new (
  this: Message, __dirname: string, __filename: string, module: NodeJS.Module, exports: NodeJS.Module['exports'], require: NodeJS.Require, lang: lang
) => GenericFunction<isAsync extends true ? Promise<unknown> : unknown>;

export type FlattenedGuildSettings = SettingsPaths<Database['guildSettings'][Snowflake]>;
export type FlattenedUserSettings = SettingsPaths<Database['userSettings'][Snowflake]>;

export declare class WebServer<Ready extends boolean = boolean> extends LibWebServer<Ready> {
  db: DB<Database>;
  client: Client<Ready>;
}

type GetReadyState<T> = T extends GenericFunction
  ? ThisParameterType<T> extends LibWebServer<infer Ready>
    ? Ready
    : never
  : never;

// Modifying the `this` type and params
export type CustomPage<RunReqBody = unknown, RunResBody = unknown> = {
  [K in keyof LibCustomPage]: K extends 'run'
    ? (
        this: WebServer<true>,
        res: Response<RunResBody | undefined>,
        req: Request<undefined, undefined, RunReqBody | undefined>,
        next: NextFunction
      ) => Promise<unknown>
    : LibCustomPage[K];
};

// Modifying the `this` type
export type DashboardSetting = ReplaceMethods<LibDashboardSetting, {
  [K in 'set' | 'get' | 'type']: WebServer<GetReadyState<LibDashboardSetting[K]>>
}>;