/**
 * Resolves media URLs for brand experiences.
 * Prioritizes Cloudflare R2 / CDN public domains, falls back to local /public assets.
 */
export function getBrandMediaUrl(brandSlug: string, assetPath: string): string {
  const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_DOMAIN
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath

  if (publicDomain && !publicDomain.includes('.r2.cloudflarestorage.com')) {
    const base = publicDomain.endsWith('/') ? publicDomain.slice(0, -1) : publicDomain
    return `${base}/brand-assets/${brandSlug}/${cleanPath}`
  }

  // Fallback to local /public or media proxy
  return `/experiences/${brandSlug}/${cleanPath}`
}
