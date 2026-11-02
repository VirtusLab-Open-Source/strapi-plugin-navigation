import { Core } from '@strapi/strapi';

import { setupCacheStrategy } from '../../src/cache';
import clientRoutes from '../../src/routes/client';
import { getCacheStatus } from '../../src/services/admin/utils';
import { asProxy } from '../utils';

jest.mock('../../src/services/admin/utils', () => ({
  __esModule: true,
  getCacheStatus: jest.fn(),
}));

const getCacheStatusMock = getCacheStatus as jest.MockedFunction<typeof getCacheStatus>;

describe('setupCacheStrategy', () => {
  const originalWarn = console.warn;

  beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.warn = originalWarn;
  });

  const buildStrapi = (
    overrides: {
      routerUse?: jest.Mock;
      pluginMiddleware?: jest.Mock | null;
      configGetReturn?: any;
    } = {}
  ): { strapi: Core.Strapi; routerUse: jest.Mock } => {
    const routerUse = overrides.routerUse ?? jest.fn();
    const middleware =
      overrides.pluginMiddleware === undefined
        ? jest.fn(() => (_ctx: unknown, next: () => void) => next())
        : overrides.pluginMiddleware;

    const pluginProxy = middleware
      ? { middleware: jest.fn(() => middleware) }
      : { middleware: jest.fn(() => undefined) };

    const strapi = asProxy<Core.Strapi>({
      plugin: jest.fn(() => pluginProxy) as any,
      config: {
        get: jest.fn(() => overrides.configGetReturn),
      } as any,
      server: {
        router: {
          use: routerUse,
        },
      } as any,
    });

    return { strapi, routerUse };
  };

  it('does nothing when the rest-cache plugin is absent', async () => {
    getCacheStatusMock.mockResolvedValue({ hasCachePlugin: false, enabled: false });
    const { strapi, routerUse } = buildStrapi();

    await setupCacheStrategy({ strapi });

    expect(routerUse).not.toHaveBeenCalled();
    expect(strapi.plugin).not.toHaveBeenCalled();
  });

  it('does nothing when caching is not enabled in the navigation config', async () => {
    getCacheStatusMock.mockResolvedValue({ hasCachePlugin: true, enabled: false });
    const { strapi, routerUse } = buildStrapi();

    await setupCacheStrategy({ strapi });

    expect(routerUse).not.toHaveBeenCalled();
    expect(strapi.plugin).not.toHaveBeenCalled();
  });

  it('warns and stops if the rest-cache plugin has no `recv` middleware', async () => {
    getCacheStatusMock.mockResolvedValue({ hasCachePlugin: true, enabled: true });
    const { strapi, routerUse } = buildStrapi({ pluginMiddleware: null });

    await setupCacheStrategy({ strapi });

    expect(console.warn).toHaveBeenCalledWith(
      'Cache middleware not present in cache plugin. Stopping'
    );
    expect(routerUse).not.toHaveBeenCalled();
  });

  it('registers a cache-wrapped route per navigation client route', async () => {
    getCacheStatusMock.mockResolvedValue({ hasCachePlugin: true, enabled: true });
    const middlewareFactory = jest.fn(() => (_ctx: unknown, next: () => void) => next());
    const { strapi, routerUse } = buildStrapi({
      pluginMiddleware: middlewareFactory,
      configGetReturn: { strategy: { maxAge: 12345 } },
    });

    await setupCacheStrategy({ strapi });

    expect(middlewareFactory).toHaveBeenCalledTimes(clientRoutes.routes.length);
    for (const call of middlewareFactory.mock.calls) {
      const [{ cacheRouteConfig }] = call as any;
      expect(cacheRouteConfig).toMatchObject({
        method: 'GET',
        maxAge: 12345,
        paramNames: ['idOrSlug', 'childUIKey'],
        keys: { useHeaders: [], useQueryParams: true },
        hitpass: false,
      });
      expect(cacheRouteConfig.path.startsWith('/api/navigation')).toBe(true);
    }
    expect(routerUse).toHaveBeenCalledTimes(1);
  });

  it('falls back to a 6-minute maxAge when rest-cache exposes no strategy config', async () => {
    getCacheStatusMock.mockResolvedValue({ hasCachePlugin: true, enabled: true });
    const middlewareFactory = jest.fn(() => (_ctx: unknown, next: () => void) => next());
    // Simulate `strapi.config.get('plugin::rest-cache')` returning undefined,
    // as happens when the plugin is installed but never configured.
    const { strapi } = buildStrapi({
      pluginMiddleware: middlewareFactory,
      configGetReturn: undefined,
    });

    await setupCacheStrategy({ strapi });

    expect(middlewareFactory).toHaveBeenCalled();
    for (const call of middlewareFactory.mock.calls) {
      const [{ cacheRouteConfig }] = call as any;
      expect(cacheRouteConfig.maxAge).toBe(6 * 60 * 1000);
    }
  });
});
