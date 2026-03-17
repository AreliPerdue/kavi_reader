import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id ?? token.sub;
      }
      // guarda el flag remember si lo recibes desde signIn
      if (account && (account as any).remember !== undefined) {
        token.remember = (account as any).remember;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      // expone el flag remember en la sesión
      (session as any).remember = token.remember ?? false;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
};

// 👇 Named exports para cada método HTTP
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);
export const PUT = NextAuth(authOptions);
