import { Suspense } from 'react';
import { SearchClient } from './_components/search-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Search | MONOGRAM',
  description: 'Search schools, listings, suppliers and past papers across Trinidad & Tobago.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchClient />
    </Suspense>
  );
}
