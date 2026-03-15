// app/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // 👉 Si no hay sesión, manda al login
    redirect("/login");
  } else {
    // 👉 Si ya hay sesión, manda al home
    redirect("/home");
  }
}
