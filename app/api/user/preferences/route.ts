export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { normalizePreferences } from '@/lib/user-preferences';

const PROFILE_FIELDS = ['name', 'phone', 'whatsapp', 'location', 'bio'] as const;

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, email: true, name: true, phone: true, whatsapp: true, location: true, bio: true, preferences: true },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { preferences, ...profile } = user;
  return NextResponse.json({ profile, preferences: normalizePreferences(preferences) });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;

  try {
    const { profile, preferences } = await req.json();
    const data: any = {};

    if (profile && typeof profile === 'object') {
      for (const f of PROFILE_FIELDS) {
        if (f in profile) {
          const v = typeof profile[f] === 'string' ? profile[f].trim().slice(0, f === 'bio' ? 1000 : 200) : '';
          data[f] = v || null;
        }
      }
      if (typeof profile.username === 'string' && profile.username.trim()) {
        const username = profile.username.trim();
        if (username.length < 3) return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
        data.username = username;
      }
      if (typeof profile.email === 'string' && profile.email.trim()) {
        data.email = profile.email.trim().toLowerCase();
      }
    }

    if (preferences && typeof preferences === 'object') {
      data.preferences = normalizePreferences(preferences);
    }

    if (Object.keys(data).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

    await prisma.user.update({ where: { id: userId }, data });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === 'P2002') {
      const field = e?.meta?.target?.[0] ?? 'field';
      return NextResponse.json({ error: `That ${field} is already taken` }, { status: 409 });
    }
    console.error('Save preferences error:', e);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
