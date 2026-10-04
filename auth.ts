import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Build a unique username for accounts created through Google sign-in.
async function generateUsername(email: string, name?: string | null) {
  const fromEmail = email.split('@')[0] || '';
  let base = (fromEmail || name || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
  if (base.length < 3) base = `${base}user`.slice(0, 20);
  let candidate = base;
  for (let i = 0; i < 20; i++) {
    const taken = await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } });
    if (!taken) return candidate;
    candidate = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
  }
  return `${base}${Date.now()}`;
}

const baseAdapter = PrismaAdapter(prisma);

// The User table has no image/emailVerified columns and requires a username,
// so new Google users are created explicitly.
const adapter: any = {
  ...baseAdapter,
  async createUser(data: any) {
    const email = String(data.email).toLowerCase();
    const username = await generateUsername(email, data.name);
    return prisma.user.create({
      data: {
        email,
        username,
        password: null,
        name: data.name ?? null,
        role: 'user',
        lastLoginAt: new Date(),
      },
    });
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      // Google verifies email ownership, so an existing account with the same
      // email can safely be linked (checked again in the signIn callback).
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const emailOrUsername = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: emailOrUsername.toLowerCase() },
              { username: emailOrUsername },
            ],
          },
        });

        if (!user || user.suspended) return null;
        // Accounts created with Google sign-in have no password.
        if (!user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }: any) {
      if (account?.provider === 'google') {
        const email = profile?.email ? String(profile.email).toLowerCase() : '';
        if (!email || !profile?.email_verified) return false;
        const existing = await prisma.user.findUnique({
          where: { email },
          select: { suspended: true },
        });
        if (existing?.suspended) return false;
      }
      return true;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        let role = user.role;
        let username = user.username ?? user.name;
        if (account?.provider === 'google' && user.id) {
          const dbUser = await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
            select: { role: true, username: true },
          });
          role = dbUser.role;
          username = dbUser.username;
        }
        token.id = user.id;
        token.role = role;
        token.username = username;
        token.name = username;
        token.roleCheckedAt = Date.now();
        return token;
      }

      // Re-check the role periodically so an admin promoting/demoting a
      // user takes effect without waiting for the user to log out and
      // back in. The JWT is otherwise only refreshed at login.
      const ROLE_REFRESH_MS = 5 * 60 * 1000; // 5 minutes
      const lastChecked = (token.roleCheckedAt as number) || 0;
      if (token.id && Date.now() - lastChecked > ROLE_REFRESH_MS) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, suspended: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
        token.roleCheckedAt = Date.now();
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
});
