import { resolve } from 'node:path';
import type { Config } from '../types/locals.ts';

export const configPath = resolve(process.cwd(), 'config.json');

export default async function getConfig(): Promise<Partial<Config>> {
  return import(configPath);
}