import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MONOGRAM — Your School. Your Community.',
    short_name: 'MONOGRAM',
    description:
      "Trinidad & Tobago's premier school directory — find books, uniforms, past papers and suppliers for every school.",
    start_url: '/',
    display: 'standalone',
    background_color: '#f8f9fa',
    theme_color: '#663f30',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
