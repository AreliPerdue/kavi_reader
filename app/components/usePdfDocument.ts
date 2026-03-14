import { useState, useEffect } from "react";

export function usePdfDocument(userId: string) {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  // Cargar PDF desde backend (GridFS)
  const loadPdfFromServer = async (fileId: string, name: string) => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const res = await fetch(`/api/getPdf?fileId=${fileId}`);
    const arrayBuffer = await res.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    setPdfDoc(pdf);
    setFileName(name);
    setFileId(fileId);
  };

  // Subir archivo nuevo al backend
  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    const res = await fetch("/api/uploadPdf", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      await loadPdfFromServer(data.fileId, file.name);
    }
  };

  return { pdfDoc, fileName, fileId, uploadFile, loadPdfFromServer };
}
