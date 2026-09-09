import { prisma } from '@/lib/prisma';

export async function notifyAdmins(params: { type: string; title: string; message: string; link?: string }) {
  const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
  if (admins.length === 0) return;
  await prisma.notification.createMany({
    data: admins.map(admin => ({
      userId: admin.id,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link || null,
    })),
  });
}
