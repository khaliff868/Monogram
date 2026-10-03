import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const user = session?.user as any;

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { contactEmail, contactPhone, contactWhatsapp, facebook, instagram, twitter } = await req.json();

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        contactEmail: contactEmail || '',
        contactPhone: contactPhone || '',
        contactWhatsapp: contactWhatsapp || '',
        facebook: facebook || '',
        instagram: instagram || '',
        twitter: twitter || '',
      },
      create: {
        id: 'default',
        contactEmail: contactEmail || '',
        contactPhone: contactPhone || '',
        contactWhatsapp: contactWhatsapp || '',
        facebook: facebook || '',
        instagram: instagram || '',
        twitter: twitter || '',
      },
    });

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error updating site settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}