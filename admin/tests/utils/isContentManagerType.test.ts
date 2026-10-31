import { isContentManagerType } from '../../src/pages/HomePage/utils';

describe('isContentManagerType', () => {
  it('accepts api:: content types', () => {
    expect(isContentManagerType('api::page.page')).toBe(true);
  });

  it('accepts plugin:: content types', () => {
    expect(isContentManagerType('plugin::events.event')).toBe(true);
  });

  it('rejects other or missing uids', () => {
    expect(isContentManagerType('admin::user')).toBe(false);
    expect(isContentManagerType(undefined)).toBe(false);
  });
});
