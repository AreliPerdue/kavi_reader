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
    async signIn({ user }) {
      // El adapter ya crea el usuario si no existe, así que no necesitas lógica extra aquí
      return true;
    },
    async jwt({ token, user }) {
      // Cuando se crea el usuario, adjuntamos su _id al token
      if (user) {
        token.id = user.id; // el adapter expone el id del documento en Mongo
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Pasamos el ObjectId real a la sesión
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ baseUrl }) {
      // Después de login, mandamos al visor
      return `${baseUrl}/pdfviewer`;
    },
  },
});

export { handler as GET, handler as POST };
