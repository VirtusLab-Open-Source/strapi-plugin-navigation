import type { Config } from '@jest/types';
import { defaults as tsjPreset } from 'ts-jest/presets'

const config: Config.InitialOptions = {
  testMatch: ['**/__tests__/?(*.)+(spec|test).ts'],
  transform: {
    // TODO: Resolve packages versions
    ...tsjPreset.transform as any,
  },
  preset: "ts-jest",
  coverageDirectory: "./coverage/",
  collectCoverage: true,
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true
      }
    }
  }
};

export default config;