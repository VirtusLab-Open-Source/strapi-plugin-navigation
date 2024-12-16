import type { JestConfigWithTsJest } from 'ts-jest';
import type { Core } from '@strapi/strapi';
import { defaults as tsjPreset } from 'ts-jest/presets';

const config: JestConfigWithTsJest = {
  testMatch: ['**/tests/**/?(*.)+(spec|test).(t|j)s'],
  transform: {
    ...tsjPreset.transform,
  },
  preset: 'ts-jest',
  coverageDirectory: './coverage/',
  collectCoverage: true,
  reporters: ['default', 'jest-junit'],
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
    strapi: {} as Core.Strapi,
  },
  prettierPath: null,
};

export default config;
