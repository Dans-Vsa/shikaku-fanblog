import type { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '@/components/layout/RootLayout';
import BootScreen from '@/components/layout/BootScreen';

/** Code splitting per halaman: tiap route jadi chunk terpisah. */
const page = (loader: () => Promise<{ default: ComponentType }>) => async () => {
  const mod = await loader();
  return { Component: mod.default };
};

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: RootLayout,
      HydrateFallback: BootScreen,
      children: [
        { index: true, lazy: page(() => import('@/pages/Landing')) },
        { path: 'baca', lazy: page(() => import('@/pages/Read')) },
        {
          path: 'wiki',
          children: [
            { index: true, lazy: page(() => import('@/pages/Wiki/WikiIndex')) },
            { path: 'karakter', lazy: page(() => import('@/pages/Wiki/Characters')) },
            { path: 'sinopsis', lazy: page(() => import('@/pages/Wiki/Synopsis')) },
            { path: 'tema', lazy: page(() => import('@/pages/Wiki/Themes')) },
            { path: 'kanji', lazy: page(() => import('@/pages/Wiki/Kanji')) },
            { path: 'produksi', lazy: page(() => import('@/pages/Wiki/Production')) },
            { path: 'glosarium', lazy: page(() => import('@/pages/Wiki/Glossary')) },
          ],
        },
        { path: 'anime', lazy: page(() => import('@/pages/Anime')) },
        { path: 'fujimoto', lazy: page(() => import('@/pages/Fujimoto')) },
        { path: 'komunitas', lazy: page(() => import('@/pages/Community')) },
        { path: 'baca-resmi', lazy: page(() => import('@/pages/OfficialLinks')) },
        { path: 'kredit', lazy: page(() => import('@/pages/Credits')) },
        { path: '*', lazy: page(() => import('@/pages/NotFound')) },
      ],
    },
  ],
  {
    // '/shikaku-fanblog/' saat build untuk GitHub Pages, '/' saat dev
    basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
  },
);
