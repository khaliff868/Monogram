import { LoginClient } from './_components/login-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Login | MONOGRAM' };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect('/dashboard');
  return <LoginClient />;
}
