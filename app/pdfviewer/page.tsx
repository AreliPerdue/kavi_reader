"use client";

import { useSession } from "next-auth/react";
import PdfViewer from "../components/PdfViewer";

export default function PdfViewerPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Cargando sesión...</p>;
  }

  if (!session?.user?.id) {
    return <p>No se encontró el usuario. Inicia sesión primero.</p>;
  }

  const userId = session.user.id; // ahora TypeScript sabe que existe

  return (
    <main style={{ height: "100vh", width: "100%" }}>
      <PdfViewer userId={userId} />
    </main>
  );
}
