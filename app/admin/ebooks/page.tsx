import { AdminEbooksClient } from './_components/admin-ebooks-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Manage E-Books | MONOGRAM Admin' };

export default function AdminEbooksPage() {
  return <AdminEbooksClient />;
}
