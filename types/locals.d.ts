import type Discord from 'discord.js';
import type DBStructure from './database';

type autocompleteOptions = string | number | { name: string; value: string };

type BaseCommand<initialized extends boolean = boolean> = {

  /** Numbers in milliseconds*/
  cooldowns?: { guild?: number; channel?: number; user?: number };

  /** Makes the command also work in direct messages.*/
  dmPermission?: boolean;

  /** Beta commands are the only commands that get loaded when `client.env == 'dev'`.*/
  beta?: boolean;

  /** This command will not be loaded*/
  disabled?: boolean;

  /** If enabled in {@link ./config.json} and set here, will be shown to the user when they try to run the command.*/
  disabledReason?: string;

  /** Slash command options*/
  options?: CommandOption[];
}
& (initialized extends true ? {

  /**
   * Gets set to the command's filename.
   * For slash commands, must be lowercase.*/
  name: string;

  /** Currently not used*/
  nameLocalizations?: Record<string, BaseCommand<true>['name']>;

  /**
   * Gets set automatically from language files.
   * For slash commands, can not be longer then 100 chars.*/
  description: string;

  /**
   * Gets set automatically from language files.
   * `undefined` only for an unknown language
   * @see {@link BaseCommand.description BaseCommand<true>.description }*/
  descriptionLocalizations: Record<string, BaseCommand<true>['description'] | undefined>;

  /**
   * Command usage information for the end-user.
   * Should be in the command file if its language-independent, otherwise in the language files.
   *
   * Gets modified upon initialization.*/
  usage: { usage?: string; examples?: string };


  /**
   * Gets set automatically from language files.
   * @see {@link BaseCommand.usage BaseCommand<true>.usage}*/
  usageLocalizations: Record<string, BaseCommand['usage']>;

  /** Gets set to the lowercase folder name the command is in.*/
  category: string;

  permissions?: {
    client?: Discord.PermissionFlags[];
    user?: Discord.PermissionFlags[];
  };

  /**
   * **Do not set manually.**
   *
   * If the command is an alias, this property will have the original name.*/
  aliasOf?: BaseCommand['name'];

  /**
   * **Do not set manually.**
   *
   * The command's full file path, used for e.g. reloading the command.*/
  filePath: string;
} : {

  /** @deprecated Change the filename to the desired name instead.*/
  name?: string;

  /** @deprecated Use language files instead.*/
  description?: string;

  usage?: { usage?: string; examples?: string };

  /** @deprecated Change the directory name to the desired category instead.*/
  category?: string;

  permissions?: {
    client?: (keyof Discord.PermissionFlags)[];
    user?: (keyof Discord.PermissionFlags)[];
  };
});

interface Config {
  /** Will always include the bot's user id and the application owner id*/
  devIds: Set<Snowflake>;
  website: {
    baseDomain?: string;
    domain?: string;
    port?: string;
    dashboard?: string;
    privacyPolicy?: string;
    invite?: string;
  };
  github: {
    repo?: string;
    userName?: string;
    repoName?: string;
  };

  /** @default ['owner-only']*/
  ownerOnlyFolders: string[];
  discordInvite?: string;
  mailAddress?: string;
  hideOverwriteWarning?: boolean;
  hideNonBetaCommandLog?: boolean;
  hideDisabledCommandLog?: boolean;

  /** @default true*/
  replyOnDisabledCommand: boolean;

  /** @default true*/
  replyOnNonBetaCommand: boolean;
  disableWebserver?: boolean;
  enableConsoleFix?: boolean;
}

interface Env {
  environment: string;
  keys: {
    humorAPIKey: string;
    rapidAPIKey: string;
    githubKey: string;
    chatGPTApiKey: string;
    dbdLicense: string;
    votingWebhookURL?: string;
    token: string;
    secret: string;
  };
  dbConnectionStr: string;
}

// @ts-expect-error 2681
type BoundFunction = new (this: Message, __dirname: string, __filename: string, module: NodeJS.Module, exports: NodeJS.Module['exports'], require: NodeJS.Require, lang: lang) => FunctionConstructor;

type FlattenedGuildSettings = DBStructure.FlattenObject<NonNullable<Database['guildSettings'][Snowflake]>>;
type FlattenedUserSettings = DBStructure.FlattenObject<NonNullable<Database['userSettings'][Snowflake]>>;