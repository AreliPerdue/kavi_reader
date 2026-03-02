"use client";

import { useState, useRef } from "react";

export default function PdfViewer() {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderPage = async (num: number, pdfjsLib: any, pdf: any) => {
    if (!pdf || !canvasRef.current) return;
    const page = await pdf.getPage(num);

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context!, viewport }).promise;
  };

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async () => {
        if (!reader.result) return;
        try {
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

          // 👇 Create the PDF object
          const pdf = await pdfjsLib.getDocument({ data: reader.result as ArrayBuffer }).promise;

          // Save it in state (for later navigation)
          setPdfDoc(pdf);
          setPageNum(1);

          // 👇 Immediately render using the local pdf object
          renderPage(1, pdfjsLib, pdf);
        } catch (err) {
          console.error("Error loading PDF:", err);
        }
      };
      reader.readAsArrayBuffer(uploadedFile);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Upload a PDF</h2>
      <input type="file" onChange={handleFile} />
      <div style={{ marginTop: "1rem" }}>
        <canvas ref={canvasRef} style={{ border: "1px solid #ccc" }} />
      </div>
    </div>
  );
}
