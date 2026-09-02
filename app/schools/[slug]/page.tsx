import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { SchoolDetailClient } from './_components/school-detail-client';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const school = await prisma.school.findUnique({ where: { slug }, select: { name: true, description: true, location: true } });
  if (!school) return { title: 'School Not Found' };
  const description = school?.description ?? `${school.name} in ${school.location} - Trinidad & Tobago school directory.`;
  return {
    title: `${school.name} | MONOGRAM`,
    description,
    openGraph: {
      title: `${school.name} | MONOGRAM`,
      description,
      type: 'website',
    },
  };
}

export default async function SchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const school = await prisma.school.findUnique({ where: { slug, visible: true } });
  if (!school) notFound();

  // Track page view
  await prisma.schoolPageView.create({ data: { schoolId: school.id } }).catch(() => {});

  return <SchoolDetailClient school={JSON.parse(JSON.stringify(school))} />;
}
