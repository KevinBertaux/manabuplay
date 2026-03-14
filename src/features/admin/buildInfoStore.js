function normalizeString(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

export function normalizeBuildInfo(raw = {}) {
  const gitSha = normalizeString(raw.gitSha);

  return {
    appName: normalizeString(raw.appName),
    appVersion: normalizeString(raw.appVersion),
    gitSha,
    gitShortSha: normalizeString(raw.gitShortSha) || (gitSha ? gitSha.slice(0, 7) : null),
    gitBranch: normalizeString(raw.gitBranch),
    buildDate: normalizeString(raw.buildDate),
    deployContext: normalizeString(raw.deployContext),
    deployId: normalizeString(raw.deployId),
    url: normalizeString(raw.url),
    deployUrl: normalizeString(raw.deployUrl),
    publicPath: '/build-info.json',
  };
}

export async function fetchBuildInfo(fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== 'function') {
    return null;
  }

  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    return null;
  }

  try {
    const response = await fetchImpl(`/build-info.json?ts=${Date.now()}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return null;
    }
    return normalizeBuildInfo(await response.json());
  } catch {
    return null;
  }
}
