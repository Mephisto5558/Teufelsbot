import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { DB } from '@mephisto5558/mongoose-db';

const
  defaultValueLoggingMaxJSONLength = 100,
  requiredEnv = [
    'environment',
    'humorAPIKey', 'rapidAPIKey',
    'githubKey', 'chatGPTApiKey',
    'dbdLicense',
    'dbConnectionStr', 'token', 'secret'
  ];

export async function loadEnv(this: Client<boolean>): Promise<void> {
  // process.loadEnvFile does not overwrite existing keys
  Object.assign(process.env, parseEnv(await readFile('.env', { encoding: 'utf8' })));

  if (process.env.environment != 'main') {
    try {
      // process.loadEnvFile does not overwrite existing keys
      Object.assign(process.env, parseEnv(await readFile(`.env.${process.env.environment}`, { encoding: 'utf8' })));
    }
    catch (err) {
      if (err.code == 'ENOENT') {
        throw new Error(
          `Missing "env.${process.env.environment}" file. Tried to import based on "environment" env variable in ".env".`,
          { cause: err }
        );
      }

      throw new Error(`Could not parse "env.${process.env.environment}" file.`, { cause: err });
    }
  }

  const missingEnv = requiredEnv.filter(e => !process.env[e]);
  if (missingEnv.length) throw new Error(`Missing required environment variable(s) "${missingEnv.join('", "')}"`);

  this.botType = process.env.environment;
}

export async function loadDB(this: Client<boolean>): Promise<void> {
  const db = await new DB().init(
    process.env.dbConnectionStr, 'db-collections',
    defaultValueLoggingMaxJSONLength, log._log.bind(log, { file: 'debug', type: 'DB' })
  );

  if (!db.cache.size) {
    log('Database is empty, generating default data');
    await db.generate();
  }

  this.db = db;
}


export async function loadEnvAndDB<
  Ready extends boolean
>(this: StrictOmit<Client<Ready>, 'db'>): Promise<void> {
  await loadEnv.call(this);
  await loadDB.call(this);
}