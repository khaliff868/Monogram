import { SignupClient } from './_components/signup-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Sign Up | MONOGRAM' };

export default async function SignupPage() {
  const session = await auth();
  if (session) redirect('/dashboard');
  return <SignupClient />;
}
