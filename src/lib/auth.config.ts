import type { NextAuthConfig } from "next-auth";

// Lightweight auth config — no Prisma or bcrypt imports.
// Safe to use in Edge Runtime (middleware).
export const authConfig: NextAuthConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.jobTitle = (user as { jobTitle?: string }).jobTitle;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { jobTitle?: string }).jobTitle = token.jobTitle as string;
      }
      return session;
    },
  },
  providers: [], // Credentials provider added in auth.ts (Node.js only)
};
