import type Discord from 'discord.js';
import type { Locale } from '@mephisto5558/i18n';
import type { SettingsPaths } from '@mephisto5558/mongoose-db';

type autocompleteOptions = string | number | { name: string; value: string };

type BaseCommand<initialized extends boolean = boolean> = {

  /** Numbers in milliseconds */
  cooldowns?: { guild?: number; channel?: number; user?: number };

  /** Makes the command also work in direct messages. */
  dmPermission?: boolean;

  /** Beta commands are the only commands that get loaded when `client.env == 'dev'`. */
  beta?: boolean;

  /** This command will not be loaded */
  disabled?: boolean;

  /** If enabled in {@link ./config.json} and set here, will be shown to the user when they try to run the command. */
  disabledReason?: string;

  /** Slash command options */
  options?: commandOptions<initialized>[];
}
& (initialized extends true ? {

  /**
   * Gets set to the command's filename.
   * For slash commands, must be lowercase. */
  name: string;

  /** Currently not used */
  nameLocalizations?: Record<string, BaseCommand<true>['name']>;

  /**
   * Gets set automatically from language files.
   * For slash commands, can not be longer then 100 chars. */
  description: string;

  /**
   * Gets set automatically from language files.
   * `undefined` only for an unknown language
   * @see {@link command.description} */
  descriptionLocalizations: Record<Locale, BaseCommand<true>['description']>;

  /**
   * Command usage information for the end-user.
   * Should be in the command file if its language-independent, otherwise in the language files.
   *
   * Gets modified upon initialization. */
  usage: { usage?: string; examples?: string };


  /**
   * Gets set automatically from language files.
   * @see {@link command.usage} */
  usageLocalizations: Record<string, BaseCommand['usage']>;

  /** Gets set to the lowercase folder name the command is in. */
  category: string;

  permissions?: {
    client?: Discord.PermissionFlags[];
    user?: Discord.PermissionFlags[];
  };

  /**
   * **Do not set manually.**
   *
   * If the command is an alias, this property will have the original name. */
  aliasOf?: BaseCommand['name'];

  /**
   * **Do not set manually.**
   *
   * The command's full file path, used for e.g. reloading the command. */
  filePath: string;
} : {

  /** @deprecated Change the filename to the desired name instead. */
  name?: string;

  /** @deprecated Use language files instead. */
  description?: string;

  usage?: { usage?: string; examples?: string };

  /** @deprecated Change the directory name to the desired category instead. */
  category?: string;

  permissions?: {
    client?: (keyof Discord.PermissionFlags)[];
    user?: (keyof Discord.PermissionFlags)[];
  };
});

type Config = {
  /** Will always include the application owner (or application team owner if existing) id */
  devIds: Set<Snowflake>;
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

  /** @default ['dev-only'] */
  ownerOnlyFolders: string[];
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
  enableConsoleFix?: boolean;
};

type BoundFunction = new (
  this: Message, __dirname: string, __filename: string, module: NodeJS.Module, exports: NodeJS.Module['exports'], require: NodeJS.Require, lang: lang
) => FunctionConstructor;

type FlattenedGuildSettings = SettingsPaths<Database['guildSettings'][Snowflake]>;
type FlattenedUserSettings = SettingsPaths<Database['userSettings'][Snowflake]>;