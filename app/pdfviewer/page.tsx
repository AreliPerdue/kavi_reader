"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import PdfViewer from "../components/PdfViewer";

export default function PdfViewerPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const fileKey = searchParams?.get("key") ?? "";

  if (status === "loading") {
    return <p>Cargando sesión...</p>;
  }

  if (!session?.user) {
    return <p>No se encontró el usuario. Inicia sesión primero.</p>;
  }

  if (!fileKey) {
    return <p>No se encontró el archivo PDF.</p>;
  }

  return (
    <main style={{ height: "100vh", width: "100%" }}>
      <PdfViewer fileKey={fileKey} />
    </main>
  );
}
