import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // 👈 añadimos el id
    } & DefaultSession["user"];
  }

  interface User {
    id: string; // 👈 también lo añadimos al tipo User
  }
}
