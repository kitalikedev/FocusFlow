import { ClientApp } from './ClientApp';

// One route catches every path; the app inside decides which page to show (issue #60).
export function generateStaticParams() {
  return [{ slug: [''] }];
}

export default function Page() {
  return <ClientApp />;
}
