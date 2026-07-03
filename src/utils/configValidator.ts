import { writeFile } from 'node:fs/promises';
import { isCodedError } from '@mephisto5558/command';
import getConfig, { configPath } from './getConfig.ts';
import type { Config } from '../types/locals.ts';

export const validConfig = {
  devIds: 'object', // set<string>
  devOnlyFolders: ['string'],
  website: {
    domain: 'string',
    port: 'number',
    dashboard: 'string',
    privacyPolicy: 'string',
    invite: 'string',
    uptime: 'string',
    vote: 'string',
    todo: 'string'
  } as const,
  github: {
    repo: 'string',
    userName: 'string',
    repoName: 'string'
  } as const,
  discordInvite: 'string',
  mailAddress: 'string',
  hideOverwriteWarning: 'boolean',
  hideNonBetaCommandLog: 'boolean',
  hideDisabledCommandLog: 'boolean',
  replyOnDisabledCommand: 'boolean',
  replyOnNonBetaCommand: 'boolean',
  disableWebServer: 'boolean',
  disableCommands: 'boolean',
  enableConsoleFix: 'boolean'
} as const;

export type validConfigPrimitives = 'object' | 'string' | 'boolean' | 'number';
export type validConfigEntry = validConfigPrimitives | [validConfigPrimitives] | { [key: string]: validConfigEntry };

export async function configValidationLoop(obj?: Record<string, unknown>, checkObj: typeof validConfig = validConfig, allowNull = true): void {
  /* eslint-disable valid-typeof -- this logic is dynamic */
  for (const [key, value] of Object.entries(obj ?? await getConfig())) {
    if (!(key in checkObj)) {
      log.warn(`Unknown key or subkey "${key}" in config.json.`);
      continue;
    }

    if (allowNull && value == undefined) continue;

    const expectedType = checkObj[key];
    if (typeof expectedType === 'string' && typeof value !== expectedType)
      throw new Error(`Invalid type for key or subkey ${key} in config.json: Expected ${expectedType}, got ${typeof value}`);
    if (Array.isArray(expectedType) && !(Array.isArray(value) && value.every(v => typeof v === expectedType[0])))
      throw new Error(`Invalid type for key or subkey ${key} in config.json: Expected Array of ${expectedType[0]}, got ${typeof value}`);

    if (typeof value == 'object') configValidationLoop(value, checkObj[key]);
  }

  /* eslint-enable valid-typeof */
}

export async function setDefaultConfig(): Promise<Partial<Config>> {
  let config: Partial<Config>;
  try { config = await getConfig(); }
  catch (err) {
    if (!isCodedError(err, 'MODULE_NOT_FOUND')) throw err;
    log.warn('Missing config.json. This file is required to run the bot.');

    await writeFile(configPath, '{}');
    config = {};

    log.warn('An empty config.json has been created.');
  }

  config.devIds = new Set(config.devIds);
  config.website ??= {};
  config.github ??= {};
  config.replyOnDisabledCommand ??= true;
  config.replyOnNonBetaCommand ??= true;
  config.devOnlyFolders = config.devOnlyFolders?.map(e => e.toLowerCase()) ?? ['dev-only'];

  return config;
}