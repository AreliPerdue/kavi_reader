"use client";

import { useSession } from "next-auth/react";
import PdfViewer from "../components/PdfViewer";

export default function PdfViewerPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Cargando sesión...</p>;
  }

  if (!session || !session.user) {
    return <p>No se encontró el usuario. Inicia sesión primero.</p>;
  }

  // Ahora sí existe gracias al callback en NextAuth
  const userId = (session.user as any).id;

  if (!userId) {
    return <p>El usuario no tiene un ID válido.</p>;
  }

  return (
    <main style={{ height: "100vh", width: "100%" }}>
      <PdfViewer userId={userId} />
    </main>
  );
}
