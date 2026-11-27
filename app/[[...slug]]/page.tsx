import type { Metadata } from 'next';
import { titleForPath } from '@/core/ui/pageTitles';
import { ClientApp } from './ClientApp';

type PageProps = { params: Promise<{ slug?: string[] }> };

// One route catches every path; the app inside decides which page to show (issue #60).
// Every page of the site is built ahead of time so each one is sent with its own title.
export function generateStaticParams() {
  return [{ slug: [''] }, ...['themes', 'analytics', 'tracking', 'about', 'app'].map((page) => ({ slug: [page] }))];
}

// Without this, Next.js sets the tab title of the root layout again after the app has started,
// so a page opened directly or reloaded showed "FocusFlow" instead of "Themes · FocusFlow".
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: titleForPath(slug) };
}

// The biggest element of the Themes page is the picture of the workspace in the default theme (nebula). The browser
// only learns about it once the app has started, which delays the largest paint (Lighthouse LCP), so ask for it up
// front. The values are the ones the page uses for its `<img>` (ThemesPage.tsx).
const THEMES_PREVIEW = {
  small: '/images/home/theme-nebula-720.webp',
  srcSet: '/images/home/theme-nebula-720.webp 720w, /images/home/theme-nebula.webp 1440w',
  sizes: '(min-width: 1200px) 1160px, calc(100vw - 32px)',
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return (
    <>
      {slug?.[0] === 'themes' && (
        <link
          rel="preload"
          as="image"
          href={THEMES_PREVIEW.small}
          imageSrcSet={THEMES_PREVIEW.srcSet}
          imageSizes={THEMES_PREVIEW.sizes}
          fetchPriority="high"
        />
      )}
      <ClientApp />
    </>
  );
}
