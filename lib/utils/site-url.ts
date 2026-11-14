/**
 * Resolves the canonical, absolute base URL for the site.
 * Ensures social crawlers (LinkedIn, Facebook, Instagram, Twitter/X, WhatsApp)
 * always receive an active, reachable HTTPS host for OpenGraph previews.
 */
export function getSiteUrl(): string {
  // If custom domain is explicitly enabled and verified
  if (process.env.NEXT_PUBLIC_USE_CUSTOM_DOMAIN === 'true') {
    return 'https://salihbenotman.dev'
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL

  // If an active URL is specified in env (excluding inactive domain without DNS)
  if (envUrl && !envUrl.includes('salihbenotman.dev')) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl
  }

  // Automatic Railway environment detection
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  }

  // Default active production deployment on Railway
  return 'https://al-edrisy.up.railway.app'
}

/**
 * Converts any relative path or image URL to a fully qualified, absolute HTTPS URL.
 * Social crawlers (LinkedIn, Facebook, Twitter) strictly require absolute URLs.
 */
export function toAbsoluteUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) {
    return `${getSiteUrl()}/og-image.png`
  }

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    // If URL points to unreachable domain, rewrite to the active site URL
    if (pathOrUrl.includes('salihbenotman.dev') && process.env.NEXT_PUBLIC_USE_CUSTOM_DOMAIN !== 'true') {
      return pathOrUrl
        .replace('https://salihbenotman.dev', getSiteUrl())
        .replace('http://salihbenotman.dev', getSiteUrl())
    }
    return pathOrUrl
  }

  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${getSiteUrl()}${cleanPath}`
}
