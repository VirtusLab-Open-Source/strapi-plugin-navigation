import type { JestConfigWithTsJest } from 'ts-jest';
import type { Core } from '@strapi/strapi';
import { defaults as tsjPreset } from 'ts-jest/presets';

const config: JestConfigWithTsJest = {
  testMatch: ['**/tests/**/?(*.)+(spec|test).(t|j)s'],
  transform: {
    ...tsjPreset.transform,
    // @faker-js/faker v10+ ships ESM only; transpile it to CJS for Jest.
    '^.+/node_modules/@faker-js/faker/.+\\.js$': [
      'ts-jest',
      { tsconfig: { allowJs: true, module: 'commonjs' }, isolatedModules: true },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!@faker-js/faker/)'],
  preset: 'ts-jest',
  coverageDirectory: './coverage/',
  collectCoverage: true,
  reporters: ['default', 'jest-junit'],
  globals: {
    'ts-jest': {
      tsconfig: './server/tsconfig.json',
      diagnostics: {
        warnOnly: true,
      },
    },
    strapi: {} as Core.Strapi,
  },
  prettierPath: null,
};

export default config;
