import { AdminListingsClient } from './_components/admin-listings-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Manage Listings | MONOGRAM Admin' };

export default function AdminListingsPage() {
  return <AdminListingsClient />;
}
