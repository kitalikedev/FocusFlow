'use client';

import dynamic from 'next/dynamic';

// The stores read localStorage as soon as they load, so the app is rendered in the browser only.
const ClientEntry = dynamic(() => import('@/app/ClientEntry'), { ssr: false });

export function ClientApp() {
  return <ClientEntry />;
}
