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

export default function Page() {
  return <ClientApp />;
}
