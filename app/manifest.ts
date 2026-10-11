import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Salih Ben Otman - Full Stack Developer Portfolio',
    short_name: 'Salih Portfolio',
    description: 'Professional Full Stack Software Developer, UI/UX Engineer, and AI Systems Builder portfolio showcasing 50+ completed projects.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
