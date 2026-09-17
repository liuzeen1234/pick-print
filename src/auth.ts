import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validation";

/**
 * Auth.js v5 配置。
 * - Credentials Provider：账号名 + 密码登录，bcrypt 校验哈希。
 * - session 用 JWT 策略（无需额外的 session 表）。
 * - callbacks 里把 userId / username / phone 带进 token 和 session。
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "账号名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }
        const { username, password } = parsed.data;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          return null;
        }

        return {
          id: user.id,
          name: user.username,
          phone: user.phone,
          opLevel: user.opLevel,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.username = user.name ?? undefined;
        token.phone = (user as { phone?: string }).phone;
        token.opLevel = (user as { opLevel?: number }).opLevel;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.username as string;
        session.user.phone = token.phone as string;
        session.user.opLevel = (token.opLevel as number | undefined) ?? 1;
      }
      return session;
    },
  },
});
