"use client";

import { useState, useEffect } from "react";
import { PdfNavigation } from "./PdfNavigation";
import { PdfPageRenderer } from "./PdfPageRenderer";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export default function PdfViewer({ fileKey }: { fileKey: string }) {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState(1);
  const [viewMode, setViewMode] = useState<"preview" | "kindle">("kindle");
  const [twoPage, setTwoPage] = useState(false);

  const { goPrev, goNext } = PdfNavigation({ pageNum, setPageNum, pdfDoc, twoPage });

  useEffect(() => {
    const loadPdf = async () => {
      if (!fileKey) return;

      // pedir presigned GET URL
      const res = await fetch(`/api/read?key=${fileKey}`);
      const { url } = await res.json();

      // cargar PDF
      const loadingTask = pdfjsLib.getDocument(url);
      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setPageNum(1);
    };

    loadPdf();
  }, [fileKey]);

  return (
    <div style={{ marginTop: "2rem" }}>
      {pdfDoc && (
        <>
          <PdfPageRenderer
            pdfDoc={pdfDoc}
            pageNum={pageNum}
            twoPage={twoPage}
            viewMode={viewMode}
            goPrev={goPrev}
            goNext={goNext}
          />
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            {twoPage
              ? pageNum === 1
                ? `Page 1 of ${pdfDoc?.numPages}`
                : `Pages ${pageNum}–${Math.min(pageNum + 1, pdfDoc?.numPages)} of ${pdfDoc?.numPages}`
              : `Page ${pageNum} of ${pdfDoc?.numPages}`}
          </div>
        </>
      )}
    </div>
  );
}
