const configuredBase = import.meta.env.BASE_URL ?? '/';

export function withBase(path = '/') {
  const normalizedBase = configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`;
  const normalizedPath = path.replace(/^\//, '');

  return normalizedPath ? `${normalizedBase}${normalizedPath}` : normalizedBase;
}
