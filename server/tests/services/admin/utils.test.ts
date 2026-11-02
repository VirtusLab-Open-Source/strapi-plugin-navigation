import { Core } from '@strapi/strapi';

import { getCacheStatus } from '../../../src/services/admin/utils';
import { asProxy } from '../../utils';

const buildFullConfig = (overrides: Record<string, unknown> = {}) => ({
  additionalFields: [],
  allowedLevels: 2,
  contentTypes: [],
  contentTypesNameFields: {},
  contentTypesPopulate: {},
  gql: { navigationItemRelated: [] },
  pathDefaultFields: {},
  cascadeMenuAttached: true,
  preferCustomContentTypes: false,
  ...overrides,
});

describe('getCacheStatus', () => {
  const buildStrapi = ({
    hasPlugin,
    storeValue,
  }: {
    hasPlugin: boolean;
    storeValue: Record<string, unknown>;
  }): Core.Strapi => {
    return asProxy<Core.Strapi>({
      plugin: jest.fn(() => (hasPlugin ? ({ name: 'rest-cache' } as any) : null)) as any,
      store: jest.fn(() => ({
        get: jest.fn().mockResolvedValue(storeValue),
      })) as any,
    });
  };

  it('reports no plugin when strapi.plugin("rest-cache") returns null', async () => {
    const strapi = buildStrapi({
      hasPlugin: false,
      storeValue: buildFullConfig({ isCacheEnabled: true }),
    });

    const result = await getCacheStatus({ strapi });

    expect(result).toEqual({ hasCachePlugin: false, enabled: false });
  });

  it('reports enabled=false when the plugin exists but navigation config disables caching', async () => {
    const strapi = buildStrapi({
      hasPlugin: true,
      storeValue: buildFullConfig({ isCacheEnabled: false }),
    });

    const result = await getCacheStatus({ strapi });

    expect(result).toEqual({ hasCachePlugin: true, enabled: false });
  });

  it('reports enabled=true when the plugin exists and navigation config enables caching', async () => {
    const strapi = buildStrapi({
      hasPlugin: true,
      storeValue: buildFullConfig({ isCacheEnabled: true }),
    });

    const result = await getCacheStatus({ strapi });

    expect(result).toEqual({ hasCachePlugin: true, enabled: true });
  });

  it('treats a missing isCacheEnabled field as disabled', async () => {
    const strapi = buildStrapi({ hasPlugin: true, storeValue: buildFullConfig() });

    const result = await getCacheStatus({ strapi });

    expect(result).toEqual({ hasCachePlugin: true, enabled: false });
  });
});
