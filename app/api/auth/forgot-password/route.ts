import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const GENERIC = 'If an account exists, a reset link has been sent.';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const value = email.trim();
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: value.toLowerCase() }, { username: value }] },
    });
    if (!user) return NextResponse.json({ message: GENERIC });

    const token = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || new URL(req.url).origin;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Monogram <noreply@mail.monogramtt.com>',
        to: user.email,
        subject: 'Reset your Monogram password',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg,#663f30,#0f1d3d);padding:30px;border-radius:12px;text-align:center;margin-bottom:24px;">
              <h1 style="color:white;margin:0;font-size:28px;letter-spacing:1px;">MONO<span style="color:#FFA800;">GRAM</span></h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Your School. Your Community.</p>
            </div>
            <h2 style="color:#1a1a1a;">Reset Your Password</h2>
            <p style="color:#555;line-height:1.6;">Hi ${user.username},</p>
            <p style="color:#555;line-height:1.6;">We received a request to reset your password. Click the button below to set a new one. This link expires in <strong>1 hour</strong>.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetLink}" style="background:#FFA800;color:#663f30;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color:#888;font-size:13px;line-height:1.6;">Or copy and paste this link into your browser:<br/><a href="${resetLink}" style="color:#663f30;word-break:break-all;">${resetLink}</a></p>
            <p style="color:#888;font-size:13px;">If you did not request a password reset, you can safely ignore this email.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
            <p style="color:#aaa;font-size:12px;text-align:center;">Monogram - Trinidad and Tobago</p>
          </div>
        `,
      }),
    });
    if (!res.ok) {
      console.error('Resend error:', res.status, await res.text());
      return NextResponse.json({ error: 'Could not send the reset email. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ message: GENERIC });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
