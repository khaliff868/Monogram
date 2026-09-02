import { SchoolsClient } from './_components/schools-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Schools | MONOGRAM',
  description: 'Browse all Trinidad & Tobago schools in the MONOGRAM directory.',
};

export default function SchoolsPage() {
  return <SchoolsClient />;
}
