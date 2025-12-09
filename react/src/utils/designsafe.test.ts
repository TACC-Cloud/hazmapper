import { buildDesignSafeLink } from './designsafe';

const MOCK_PORTAL_URL = 'https://www.designsafe-ci.org';

describe('buildDesignSafeLink', () => {
  it('should return empty result when system or path is null', () => {
    const result = buildDesignSafeLink(null, '/path', null, MOCK_PORTAL_URL);
    expect(result).toEqual({ url: null, displayPath: '' });
  });

  it('should handle published project', () => {
    const result = buildDesignSafeLink(
      'designsafe.storage.published',
      '/published-data/PRJ-6209/folder/file.txt',
      'PRJ-6209',
      MOCK_PORTAL_URL
    );

    expect(result.url).toBe(
      'https://www.designsafe-ci.org/data/browser/public/designsafe.storage.published/PRJ-6209/published-data/PRJ-6209/folder/file.txt'
    );
    expect(result.displayPath).toBe('PRJ-6209/folder/file.txt');
  });

  it('should handle private project with designSafeProjectId', () => {
    const result = buildDesignSafeLink(
      'some-system',
      '/folder/file.txt',
      'PRJ-1234',
      MOCK_PORTAL_URL
    );

    expect(result.url).toBe(
      'https://www.designsafe-ci.org/data/browser/projects/PRJ-1234/folder/file.txt'
    );
    expect(result.displayPath).toBe('PRJ-1234/folder/file.txt');
  });

  it('should extract UUID from project- system', () => {
    const result = buildDesignSafeLink(
      'project-abc-123',
      '/workdir/data.csv',
      null,
      MOCK_PORTAL_URL
    );

    expect(result.url).toBe(
      'https://www.designsafe-ci.org/data/browser/projects/abc-123/workdir/data.csv'
    );
    expect(result.displayPath).toBe('project-abc-123/workdir/data.csv');
  });

  it('should generate My Data display path', () => {
    const result = buildDesignSafeLink(
      'designsafe.storage.default',
      '/username/folder/file.txt',
      null,
      MOCK_PORTAL_URL
    );

    expect(result.url).toBe(
      'https://www.designsafe-ci.org/data/browser/tapis/designsafe.storage.default/username/folder/file.txt'
    );
    expect(result.displayPath).toBe('My Data/username/folder/file.txt');
  });

  it('should generate Community display path', () => {
    const result = buildDesignSafeLink(
      'designsafe.storage.community',
      '/shared/data.txt',
      null,
      MOCK_PORTAL_URL
    );

    expect(result.url).toBe(
      'https://www.designsafe-ci.org/data/browser/tapis/designsafe.storage.community/shared/data.txt'
    );
    expect(result.displayPath).toBe('Community Data/shared/data.txt');
  });

  it('should handle generic tapis system', () => {
    const result = buildDesignSafeLink(
      'custom.storage.system',
      '/path/to/file.txt',
      null,
      MOCK_PORTAL_URL
    );

    expect(result.url).toBe(
      'https://www.designsafe-ci.org/data/browser/tapis/custom.storage.system/path/to/file.txt'
    );
    expect(result.displayPath).toBe('custom.storage.system/path/to/file.txt');
  });
});
