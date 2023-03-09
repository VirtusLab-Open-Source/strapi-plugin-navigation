import { JestConfigWithTsJest } from 'ts-jest';
import { defaults as tsjPreset } from 'ts-jest/presets'

const config: JestConfigWithTsJest = {
  testMatch: ['**/__tests__/?(*.)+(spec|test).ts'],
  transform: {
    ...tsjPreset.transform,
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