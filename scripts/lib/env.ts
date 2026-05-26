import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import {rootDir} from './paths';

export const envPath = path.join(rootDir, '.env');

export const loadProjectEnv = () => {
  return dotenv.config({path: envPath, override: true});
};

export const hasProjectEnv = () => fs.existsSync(envPath);

export const readBooleanEnv = (name: string, defaultValue = false): boolean => {
  const value = process.env[name];
  if (value === undefined || value === '') {
    return defaultValue;
  }

  return value === '1' || value.toLowerCase() === 'true';
};

export const readNumberEnv = (name: string, defaultValue: number): number => {
  const value = process.env[name];
  if (value === undefined || value === '') {
    return defaultValue;
  }

  return Number(value);
};

export const validatePositiveNumberEnv = (name: string, defaultValue: number): string | null => {
  const value = readNumberEnv(name, defaultValue);
  if (Number.isFinite(value) && value > 0) {
    return null;
  }

  return `${name} must be a positive number when set.`;
};

export const requireEnv = (name: string) => {
  return Boolean(process.env[name]?.trim());
};
