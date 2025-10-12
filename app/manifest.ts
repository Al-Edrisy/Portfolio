import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Al-Edrisy - Software Developer Portfolio',
    short_name: 'Al-Edrisy',
    description: 'Portfolio of Al-Edrisy (Salih Ben Otman), a UI/UX Engineer and Full-Stack Software Developer with 5+ years of experience in AI integrations, modern web technologies, and scalable system architecture.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '64x64 32x32 24x24 16x16',
        type: 'image/x-icon',
        purpose: 'any',
      },
      {
        src: '/dark-icon.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
      {
        src: '/dark-icon.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
    ],
    categories: ['portfolio', 'software', 'development', 'technology'],
    lang: 'en',
    orientation: 'portrait-primary',
  }
}

