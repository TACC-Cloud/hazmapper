export interface DesignSafeLink {
  url: string | null;
  displayPath: string;
}

export const buildDesignSafeLink = (
  system: string | null,
  path: string | null,
  designSafeProjectId: string | null,
  designsafePortalUrl: string
): DesignSafeLink => {
  if (!system || !path) return { url: null, displayPath: '' };

  let url: string | null = null;
  let displayPath: string = '';

  if (designSafeProjectId) {
    if (system === 'designsafe.storage.published') {
      url = `${designsafePortalUrl}/data/browser/public/${system}/${designSafeProjectId}${path}`;
      displayPath = path.replace(
        `/published-data/${designSafeProjectId}`,
        designSafeProjectId
      );
    } else {
      url = `${designsafePortalUrl}/data/browser/projects/${designSafeProjectId}${path}`;
      displayPath = `${designSafeProjectId}${path}`;
    }
  } else if (system.startsWith('project-')) {
    const projectUuid = system.split('project-')[1];
    url = `${designsafePortalUrl}/data/browser/projects/${projectUuid}${path}`;
    displayPath = `project-${projectUuid}${path}`;
  } else if (system === 'designsafe.storage.default') {
    url = `${designsafePortalUrl}/data/browser/tapis/${system}${path}`;
    displayPath = `My Data${path}`;
  } else if (system === 'designsafe.storage.community') {
    url = `${designsafePortalUrl}/data/browser/tapis/${system}${path}`;
    displayPath = `Community Data${path}`;
  } else {
    url = `${designsafePortalUrl}/data/browser/tapis/${system}${path}`;
    displayPath = `${system}${path}`;
  }

  return { url, displayPath };
};