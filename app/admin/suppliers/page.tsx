import { AdminSuppliersClient } from './_components/admin-suppliers-client';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Manage Suppliers | MONOGRAM Admin' };

export default function AdminSuppliersPage() {
  return <AdminSuppliersClient />;
}
