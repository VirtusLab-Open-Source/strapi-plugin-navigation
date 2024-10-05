import type { Config } from '@jest/types';
import type { Core } from '@strapi/strapi';
import { defaults as tsjPreset } from 'ts-jest/presets';

const config: Config.InitialOptions = {
  testMatch: ['**/tests/**/?(*.)+(spec|test).ts'],
  transform: {
    // TODO: Resolve packages versions
    ...(tsjPreset.transform as any),
  },
  preset: 'ts-jest',
  coverageDirectory: './coverage/',
  collectCoverage: true,
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
    strapi: {} as unknown as Core.Strapi,
  },
  prettierPath: null,
};

export default config;
