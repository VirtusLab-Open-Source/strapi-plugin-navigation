import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import ts from 'typescript';

import pkg from '../../../package.json';

const SERVER_SRC = join(__dirname, '../../src');

const listSourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      return listSourceFiles(path);
    }

    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts') ? [path] : [];
  });

// Packages left in the emitted JS once type-only imports are elided,
// i.e. what `strapi-plugin build` has to either bundle or treat as external.
const getRuntimeStrapiImports = (file: string): string[] => {
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: file,
  });

  return Array.from(
    outputText.matchAll(/require\("(@strapi\/[^/"]+)[^"]*"\)/g),
    ([, name]) => name
  );
};

describe('Navigation', () => {
  describe('Server', () => {
    describe('Package dependencies', () => {
      it('declares every @strapi/* package used at runtime as a peer dependency', () => {
        // Undeclared packages get bundled into dist, so their error classes are not the ones
        // the host's error middleware checks against and e.g. NotFoundError ends up as 500.
        const peerDependencies: Record<string, string> = pkg.peerDependencies;
        const used = new Set(listSourceFiles(SERVER_SRC).flatMap(getRuntimeStrapiImports));

        // Then
        expect(used.size).toBeGreaterThan(0);
        expect(Array.from(used).filter((name) => !peerDependencies[name])).toEqual([]);
      });
    });
  });
});
