import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      const client = await clientPromise;
      const db = client.db();

      const existingUser = await db.collection("users").findOne({ email: user.email });

      let loginType: string | null = null;
      if (account && (account as any).url) {
        const url = new URL((account as any).url);
        loginType = url.searchParams.get("loginType");
      }

      if (loginType === "login" && !existingUser) {
        throw new Error("No se encontró la cuenta, por favor regístrate con Google.");
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 👇 Aquí decides a dónde mandar al usuario después de login
      return `${baseUrl}/pdfviewer`;
    },
  },
});

export { handler as GET, handler as POST };
