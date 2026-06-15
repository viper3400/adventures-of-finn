export function withBaseUrl(assetPath: string): string {
  const normalizedBase = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL.slice(0, -1)
    : import.meta.env.BASE_URL;

  return `${normalizedBase}${assetPath}`;
}
